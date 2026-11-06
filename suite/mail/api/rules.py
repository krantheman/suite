import re

import frappe
from frappe import _

from suite.mail import rules as mail_rules
from suite.mail.doctype.sieve_script.sieve_script import (
    AUTOMATION_SCRIPT_NAME,
    SieveScript,
    build_automation_sieve,
    get_active_own_script_name,
    get_mailbox_automation_rules,
    get_own_scripts,
    is_vacation_script_active,
)
from suite.mail.doctype.user_account.user_account import get_user_for_jmap_account
from suite.mail.jmap import get_account_client, get_mailbox_id_by_role, get_mailboxes
from suite.utils.validation import JSONList

_PREVIEW_ROWS = 5


@frappe.whitelist()
def get_rules(account: str) -> dict:
    """The account's rules, the folder rules that run after them, and whether anything keeps them
    from running now."""

    get_user_for_jmap_account(account, allow_system_manager=False, raise_exception=True)
    script = _rules_script(account)
    return {
        "rules": mail_rules.read(script["content"]) if script else [],
        "folder_rules": _folder_rules(account),
        **_standing(account),
    }


@frappe.whitelist()
def save_rules(account: str, rules: JSONList[dict]) -> dict:
    """Replaces the account's rules, in their order, and makes sure they run.

    The rules are checked and written as one script, which the server compiles before it stores it:
    a rule the server can't run is refused with the rest unchanged.
    """

    get_user_for_jmap_account(account, allow_system_manager=False, raise_exception=True)
    mailboxes = get_mailboxes(account)
    kept = mail_rules.clean(rules, mailboxes)
    content = mail_rules.write(kept, mailboxes, _roles(account))
    if len(content.encode("utf-8")) > mail_rules.MAX_SCRIPT_SIZE:
        frappe.throw(_("That's more rules than your mail server can hold. Remove some and try again."))

    if script := _rules_script(account):
        SieveScript._update_sieve_script(account, script["id"], mail_rules.RULES_SCRIPT_NAME, content)
    else:
        SieveScript._add_sieve_script(account, mail_rules.RULES_SCRIPT_NAME, content)

    # The automation script includes the rules. Activating it runs a script the person turned on by
    # hand from it, rather than switching that off; a vacation response keeps it waiting.
    build_automation_sieve(account, activate=True, raise_exception=True)
    return {"rules": kept, **_standing(account)}


@frappe.whitelist()
def preview_rule(account: str, rule: dict) -> dict:
    """The mail already received that a rule would have matched: how much, and the newest of it.

    Near enough to show a person what they are about to ask for, not exact: the server searches
    words where the rule compares text.
    """

    get_user_for_jmap_account(account, allow_system_manager=False, raise_exception=True)
    kept = mail_rules.clean(
        [{**rule, "actions": rule.get("actions") or [{"type": "mark_read"}]}], get_mailboxes(account)
    )
    client = get_account_client(account)
    with client.batch() as b:
        q = b.mail.email.query(
            filter={
                "operator": "AND",
                "conditions": [mail_rules.query_filter(kept[0]), {"notKeyword": "$draft"}],
            },
            sort=[{"property": "receivedAt", "isAscending": False}],
            limit=_PREVIEW_ROWS,
            calculate_total=True,
        )
        g = b.mail.email.get(
            ids=q.ref("/ids"), properties=["id", "threadId", "subject", "from", "receivedAt"]
        )

    rows = []
    for email in (item.to_wire() for item in g.result.items):
        sender = (email.get("from") or [{}])[0]
        rows.append(
            {
                "id": email["id"],
                "thread_id": email["threadId"],
                "subject": email.get("subject") or "",
                "from_name": sender.get("name") or "",
                "from_email": sender.get("email") or "",
                "received_at": email.get("receivedAt") or "",
            }
        )
    return {"total": q.result.total or 0, "rows": rows}


@frappe.whitelist()
def draft_rule(account: str, message_id: str) -> mail_rules.Rule:
    """A rule for mail like this message, for the person to finish: matching its mailing list where
    it came through one, as that is what the rest of that mail shares, and its sender otherwise."""

    get_user_for_jmap_account(account, allow_system_manager=False, raise_exception=True)
    client = get_account_client(account)
    with client.batch() as b:
        g = b.mail.email.get(ids=[message_id], properties=["from", "header:List-Id:asText"])
    if not g.result.items:
        frappe.throw(_("That message is gone."), frappe.DoesNotExistError)

    email = g.result.items[0].to_wire()
    list_id = (email.get("header:List-Id:asText") or "").strip()
    if match := re.search(r"<([^>]+)>", list_id):
        list_id = match.group(1)
    sender = ((email.get("from") or [{}])[0].get("email") or "").strip()
    condition: mail_rules.Condition = (
        {"field": "list_id", "op": "contains", "value": list_id}
        if list_id
        else {"field": "from", "op": "is", "value": sender}
    )
    return {
        "id": "",
        "name": list_id or sender,
        "enabled": True,
        "match": "all",
        "conditions": [condition],
        "actions": [],
    }


def _rules_script(account: str) -> dict | None:
    scripts, _total = SieveScript._fetch_sieve_scripts(
        account, {"name": mail_rules.RULES_SCRIPT_NAME}, limit=1
    )
    if not scripts:
        return None
    return SieveScript._get_sieve_scripts(account, [scripts[0]["id"]], download_content=True)[0]


def _standing(account: str) -> dict:
    """What decides whether the rules run now. `paused_by` names a script of the person's own that is
    active instead (saving a rule runs it alongside), or "vacation" while a vacation response is."""

    scripts, _total = SieveScript._fetch_sieve_scripts(account, {"name": AUTOMATION_SCRIPT_NAME}, limit=1)
    automation = scripts[0] if scripts else None
    paused_by = None
    if not (automation and automation["active"]):
        if is_vacation_script_active(account):
            paused_by = "vacation"
        elif own := get_active_own_script_name(account):
            paused_by = own
    own_scripts = []
    if automation:
        content = SieveScript._get_sieve_scripts(account, [automation["id"]], download_content=True)
        own_scripts = get_own_scripts(content[0]["content"] if content else "")
    return {"paused_by": paused_by, "own_scripts": own_scripts}


def _folder_rules(account: str) -> list[dict]:
    """The rules set on folders, which run after these: shown beside them, changed from the folder."""

    found = []
    for mailbox in get_mailboxes(account):
        if rule := get_mailbox_automation_rules(account, mailbox["id"]):
            found.append(
                {
                    "mailbox_id": mailbox["id"],
                    "folder": mailbox["_name"],
                    "emails_from": rule["emails_from"],
                    "subject_contains": rule["subject_contains"],
                    "match_if": rule["match_if"],
                    "mark_as_read": rule["mark_as_read"],
                    "add_star": rule["add_star"],
                }
            )
    return found


def _roles(account: str) -> mail_rules.Roles:
    return {
        "archive": get_mailbox_id_by_role(
            account, "archive", create_if_not_exists=True, raise_exception=False
        ),
        "trash": get_mailbox_id_by_role(account, "trash", raise_exception=False),
    }
