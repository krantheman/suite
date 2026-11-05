# Copyright (c) 2026, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt
"""Muting a conversation: its later replies stop asking for attention.

A muted conversation leaves the Inbox for Archive, and what arrives in it afterwards goes the same
way: read, with no notification and no unread count. The one exception is mail written to the
person, with one of their addresses in To. That stays in the Inbox, unread, and notifies as usual,
which brings the conversation back to their attention. The conversation stays muted: the reply after
that, if they are only copied on it, is quiet again.

A conversation is muted while any message in it carries `$muted` (RFC 9979). Stalwart gives the
keyword no meaning of its own, so Suite does the work when it hears of new mail (`hold_back`).

That step is not Sieve, though Sieve would act before the mail is even stored. Against Stalwart:
- `extlists` is advertised with no lists behind it (`externalLists` is null), so a person has nowhere
  to keep muted Message-IDs, and they would have to be spelt out in a script capped at 100 KB.
- A vacation response replaces the active script, so muting would stop for as long as one is on.
- A conversation is Stalwart's thread, which needs both a shared reference and the same base subject.
  A header test can only see the references, so it would also catch a reply with a new subject, which
  the person sees as a conversation of its own.
The cost is that a reply sits in the Inbox from delivery until Suite hears of it, usually a moment.
If Suite hears late, the mail is visible rather than lost.
"""

from typing import TypedDict

import frappe
from frappe import _

from suite.mail import filing
from suite.mail.doctype.user_account.user_account import get_user_for_jmap_account
from suite.mail.jmap import SuiteJMAPClient, chunked_get, chunked_set, get_account_client
from suite.mail.utils import log_mail_error
from suite.mail.utils.user import get_account_emails

MUTED_KEYWORD = "$muted"

# Unread mail in muted conversations looked through for each batch of new mail, newest first. There
# is little of it, as all but mail written to the person arrives read; were it ever to run over, the
# oldest new mail would only be delivered as usual.
_UNREAD_SCANNED = 100
# How long a person's addresses are remembered once read: an alias added since counts after this.
_ADDRESSES_TTL = 10 * 60


class MuteResult(TypedDict):
    """What a change did. `left_inbox`: the conversation moved out of the Inbox, so undoing it takes
    it back. `marked_read`: mail that was unread, so undoing it can mark it unread again."""

    updated: list[str]
    left_inbox: bool
    marked_read: list[str]


def is_muted_message(message: dict) -> bool:
    """Whether the message, as cached or serialized, carries the keyword."""

    keywords = message.get("keywords") or {}
    if isinstance(keywords, str):
        keywords = frappe.parse_json(keywords) or {}
    return bool(keywords.get(MUTED_KEYWORD))


def set_muted(
    account: str,
    thread_ids: list[str],
    muted: bool,
    back_to_inbox: bool = False,
    mark_unread: list[str] | None = None,
) -> MuteResult:
    """Mute or unmute whole conversations.

    Muting takes the conversation's mail out of the Inbox, marked read. Unmuting leaves it where it
    is unless `back_to_inbox` asks for Archive's mail to return, and `mark_unread` names the mail to
    mark unread again: both are how a mute is taken back.
    """

    if not account or not thread_ids:
        frappe.throw(_("Account and conversations are required."))
    get_user_for_jmap_account(account, allow_system_manager=False, raise_exception=True)

    # Imported here: mail_message imports this module.
    from suite.mail.doctype.mail_message.mail_message import _remove_cached_messages

    client = get_account_client(account)
    emails = _conversation_emails(client, thread_ids)
    roles = filing.account_roles(account)
    updates = plan_mute(emails, roles) if muted else plan_unmute(emails, roles, back_to_inbox, mark_unread)
    if not updates:
        return {"updated": [], "left_inbox": False, "marked_read": []}

    # Marked as changed before the write as well as after: a read already on its way then can't
    # cache the message as it was (see get_messages).
    _remove_cached_messages(account, list(updates))
    try:
        result = chunked_set(client, lambda b, chunk: b.mail.email.set(update=chunk), updates)
    except Exception:
        log_mail_error(_("Failed to mute conversation"), frappe.get_traceback(with_context=True))
        frappe.throw(_("Failed to change the conversation. Please try again."))
    finally:
        _remove_cached_messages(account, list(updates))

    if result.not_updated:
        log_mail_error(_("Failed to mute conversation"), str(result.not_updated))
        frappe.throw(_("Some mail could not be changed. Please try again."))

    updated = [id for id in updates if id in result.updated]
    return {
        "updated": updated,
        "left_inbox": muted and any(f"mailboxIds/{roles['inbox']}" in updates[id] for id in updated),
        "marked_read": [
            email["id"]
            for email in emails
            if muted and email["id"] in updated and "keywords/$seen" in updates[email["id"]]
        ],
    }


def plan_mute(emails: list[dict], roles: filing.Roles) -> dict[str, dict]:
    """The Email/set update muting a conversation makes to each message. A draft is left alone: the
    person is still writing it. The keyword goes on mail in any folder, so that the conversation stays
    muted whichever of its messages survives; only the Inbox's mail moves, by the filing rules."""

    updates: dict[str, dict] = {}
    in_inbox = [email for email in emails if roles["inbox"] in (email.get("mailboxIds") or {})]
    moves = filing.plan("archive", in_inbox, roles)
    for email in emails:
        keywords = email.get("keywords") or {}
        if keywords.get("$draft"):
            continue
        update = {f"keywords/{MUTED_KEYWORD}": True, **moves.get(email["id"], {})}
        if email["id"] in moves and not keywords.get("$seen"):
            update["keywords/$seen"] = True
        updates[email["id"]] = update
    return updates


def plan_unmute(
    emails: list[dict], roles: filing.Roles, back_to_inbox: bool = False, mark_unread: list[str] | None = None
) -> dict[str, dict]:
    """The Email/set update unmuting a conversation makes to each message."""

    updates: dict[str, dict] = {}
    moves = filing.plan("unarchive", emails, roles) if back_to_inbox else {}
    unread = set(mark_unread or [])
    for email in emails:
        update = dict(moves.get(email["id"], {}))
        if (email.get("keywords") or {}).get(MUTED_KEYWORD):
            update[f"keywords/{MUTED_KEYWORD}"] = None
        if email["id"] in unread:
            update["keywords/$seen"] = None
        if update:
            updates[email["id"]] = update
    return updates


def hold_back(client: SuiteJMAPClient, account: str, messages: list[dict], mailboxes: list[dict]) -> set[str]:
    """Takes new mail belonging to muted conversations out of the way, returning the ids it took.

    `messages` are the unread mail just arrived, as cached; `mailboxes` the account's. Mail in a muted
    conversation is marked read and carries the keyword, and leaves the Inbox for Archive if it is
    there. A rule that filed it elsewhere stands. Mail written to the person is left alone.

    Never raises, and answers only for what the server took: anything else is delivered as usual,
    since mail shown when it needn't have been is the lesser fault.
    """

    if not messages:
        return set()

    try:
        with client.batch() as b:
            q = b.mail.email.query(
                filter={
                    "operator": "AND",
                    "conditions": [{"someInThreadHaveKeyword": MUTED_KEYWORD}, {"notKeyword": "$seen"}],
                },
                sort=[{"property": "receivedAt", "isAscending": False}],
                limit=_UNREAD_SCANNED,
            )
        in_muted = set(q.result.ids)
        arrived = [message for message in messages if message["id"] in in_muted]
        if not arrived:
            return set()

        own = own_addresses(account)
        updates = plan_hold_back([m for m in arrived if not is_written_to(m, own)], mailboxes)
        if not updates:
            return set()
        written = chunked_set(client, lambda b, chunk: b.mail.email.set(update=chunk), updates).updated
    except Exception:
        log_mail_error(_("Failed to hold back muted mail"), frappe.get_traceback(with_context=True))
        return set()

    return {id for id in updates if id in written}


def plan_hold_back(messages: list[dict], mailboxes: list[dict]) -> dict[str, dict]:
    """The Email/set update each newly arrived message in a muted conversation takes."""

    roles = {(m.get("role") or "").lower(): m["id"] for m in mailboxes}
    inbox, archive = roles.get("inbox"), roles.get("archive")
    # Junk and Trash already keep their mail from anyone's attention, and it is no conversation's yet.
    set_aside = {roles.get("junk"), roles.get("trash")} - {None}

    updates: dict[str, dict] = {}
    for message in messages:
        boxes = {mailbox["mailbox_id"] for mailbox in message["mailboxes"]}
        if boxes & set_aside:
            continue
        update: dict[str, object] = {"keywords/$seen": True, f"keywords/{MUTED_KEYWORD}": True}
        if inbox in boxes and archive:
            update |= {f"mailboxIds/{inbox}": None, f"mailboxIds/{archive}": True}
        updates[message["id"]] = update
    return updates


def is_written_to(message: dict, own: set[str]) -> bool:
    """Whether one of the person's addresses (`own`, as `normalized`) is in the message's To."""

    return any(
        recipient.get("type") == "To" and normalized(recipient.get("email")) in own
        for recipient in message.get("recipients") or []
    )


def normalized(address: str | None) -> str:
    """An address as delivery treats it: case aside, and without any `+tag`."""

    local, at, domain = (address or "").strip().lower().partition("@")
    return f"{local.partition('+')[0]}{at}{domain}"


def own_addresses(account: str) -> set[str]:
    """Every address mail reaches this account at, as `normalized`.

    The identities are the addresses it can send from, which may be fewer: an alias has no identity
    until one is made, and an identity can be deleted while its address still receives. So the
    account's login is added, and the aliases Suite Cloud holds for it where there is one.
    """

    return {normalized(address) for address in (*get_account_emails(account), *_directory_addresses(account))}


def _directory_addresses(account: str) -> list[str]:
    """The account's login and enabled aliases. Remembered for a while, since this is asked of a
    service outside the mail server, and empty where it can't be answered: the identities remain."""

    cache_key = f"mail:own_addresses:{account}"
    if (cached := frappe.cache.get_value(cache_key)) is not None:
        return cached

    # Imported here: a site without Suite Cloud has no use for the client.
    from suite.mail.directory import find_account
    from suite.mail.suite_cloud import is_suite_cloud_configured
    from suite.mail.utils.user import get_account_email

    addresses: list[str] = []
    try:
        login = get_account_email(get_user_for_jmap_account(account, raise_exception=True))
        if login:
            addresses.append(login)
        if login and is_suite_cloud_configured() and (directory := find_account(login)):
            addresses += [
                alias["email"] for alias in directory.get("aliases") or [] if alias.get("enabled", True)
            ]
    except Exception:
        log_mail_error(_("Failed to read a mail account's aliases"), frappe.get_traceback(with_context=True))
        return addresses

    frappe.cache.set_value(cache_key, addresses, expires_in_sec=_ADDRESSES_TTL)
    return addresses


def _conversation_emails(client: SuiteJMAPClient, thread_ids: list[str]) -> list[dict]:
    """Every message of the conversations, with what a change to them needs to know."""

    threads = chunked_get(
        client,
        lambda b, chunk: b.mail.thread.get(ids=chunk, properties=["id", "emailIds"]),
        list(dict.fromkeys(thread_ids)),
    )
    ids = [id for thread in threads for id in thread.to_wire().get("emailIds", [])]
    if not ids:
        return []
    return [
        email.to_wire()
        for email in chunked_get(
            client,
            lambda b, chunk: b.mail.email.get(ids=chunk, properties=["id", "mailboxIds", "keywords"]),
            ids,
        )
    ]
