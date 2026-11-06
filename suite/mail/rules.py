# Copyright (c) 2026, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt
"""Rules: what a person asks of new mail, set without knowing Sieve.

A person's rules are kept on the mail server, in a Sieve script of their own (`RULES_SCRIPT_NAME`),
and nowhere else. Each rule is written there twice: once as a comment holding the rule itself, which
is how the rules are read back into the builder, and once as the Sieve that runs. The comment is the
truth; the Sieve is generated from it on every save.

The account's active script stays the automation script (see sieve_script), which includes this one
first: a person's own rules come before the folder rules, the Spam senders and the Screening gate.
A script the server stores has compiled, so this one cannot break the others, and a script the person
wrote by hand is included after it, so a fault in theirs cannot stop their rules either.

Rules act on mail as it is delivered. Mail already received stays where it is.
"""

import json
import re
from typing import Literal, NotRequired, TypedDict
from uuid import uuid7

import frappe
from frappe import _

from suite.mail.classification.category import Category

RULES_SCRIPT_NAME = "suite_rules"
# A rule's id comes back from the browser and is written into a comment: anything else gets a new one.
_ID = re.compile(r"^[\w-]{1,64}$")
# Stalwart's `maxSizeScript`. The server refuses a bigger script whole, so the save is refused before.
MAX_SCRIPT_SIZE = 100 * 1024
_RULE_COMMENT = "# suite-rule "
_REQUIRE = 'require ["fileinto", "mailbox", "mailboxid", "imap4flags", "body", "relational", "comparator-i;ascii-numeric"];'

Field = Literal["from", "to", "cc", "to_or_cc", "subject", "body", "list_id", "size"]
Operator = Literal["is", "contains", "domain", "over"]
ActionType = Literal["move", "archive", "trash", "mark_read", "star", "category"]

ADDRESS_FIELDS = ("from", "to", "cc", "to_or_cc")
TEXT_FIELDS = ("subject", "body", "list_id")
OPERATORS: dict[str, tuple[str, ...]] = {
    **dict.fromkeys(ADDRESS_FIELDS, ("is", "contains", "domain")),
    **dict.fromkeys(TEXT_FIELDS, ("contains", "is")),
    "size": ("over",),
}
# Actions that file the mail somewhere. A rule may have one, and it ends the rules after it.
FILING_ACTIONS = ("move", "archive", "trash")


class Condition(TypedDict):
    field: Field
    op: Operator
    # Text to match, or for `size` the kilobytes the mail is over.
    value: str
    negate: NotRequired[bool]


class Action(TypedDict):
    type: ActionType
    # The folder's id for `move`, the category for `category`.
    value: NotRequired[str]


class Rule(TypedDict):
    id: str
    name: str
    enabled: bool
    match: Literal["all", "any"]
    conditions: list[Condition]
    actions: list[Action]


class Roles(TypedDict):
    archive: str | None
    trash: str | None


def read(content: str) -> list[Rule]:
    """The rules a rules script holds, in their order. A line that does not read as a rule is passed
    over: the script is the person's, and a client of theirs may have touched it."""

    rules = []
    for line in (content or "").splitlines():
        if not line.startswith(_RULE_COMMENT):
            continue
        try:
            rule = json.loads(line[len(_RULE_COMMENT) :])
        except ValueError:
            continue
        if isinstance(rule, dict) and rule.get("id"):
            rules.append(rule)
    return rules


def write(rules: list[Rule], mailboxes: list[dict], roles: Roles) -> str:
    """The rules script holding `rules`, each as its comment and, unless switched off, its Sieve."""

    parts = [_REQUIRE]
    for rule in rules:
        parts.append("")
        parts.append(_RULE_COMMENT + json.dumps(rule, ensure_ascii=False, separators=(",", ":")))
        if rule.get("enabled", True):
            parts.append(to_sieve(rule, mailboxes, roles))
    return "\n".join(parts).rstrip() + "\n"


def clean(rules: list[dict], mailboxes: list[dict]) -> list[Rule]:
    """Checks rules as a person sent them and returns them in the shape they are kept in.

    Throws, naming the rule, on one that could not run as written: a condition with nothing to match,
    a folder that is gone, two places to file the mail in.
    """

    folder_ids = {mailbox["id"] for mailbox in mailboxes}
    categories = {category.value for category in Category}
    kept: list[Rule] = []
    for raw in rules or []:
        name = (raw.get("name") or "").strip()
        label = name or _("Untitled rule")
        conditions: list[Condition] = []
        for condition in raw.get("conditions") or []:
            field, op = condition.get("field"), condition.get("op")
            value = str(condition.get("value") or "").replace("\r", "").replace("\n", " ").strip()
            if field not in OPERATORS or op not in OPERATORS[field]:
                frappe.throw(_("Rule {0} has a condition it can't check.").format(frappe.bold(label)))
            if not value:
                frappe.throw(_("Rule {0} has a condition with nothing to match.").format(frappe.bold(label)))
            if field == "size" and not (value.isdigit() and int(value) > 0):
                frappe.throw(_("Rule {0} needs a size in KB.").format(frappe.bold(label)))
            if op == "domain":
                value = value.lstrip("@")
            kept_condition: Condition = {"field": field, "op": op, "value": value}
            if condition.get("negate"):
                kept_condition["negate"] = True
            conditions.append(kept_condition)

        actions: list[Action] = []
        for action in raw.get("actions") or []:
            kind = action.get("type")
            if kind not in ("move", "archive", "trash", "mark_read", "star", "category"):
                frappe.throw(_("Rule {0} has an action it can't take.").format(frappe.bold(label)))
            if kind == "move" and action.get("value") not in folder_ids:
                frappe.throw(_("Rule {0} moves mail to a folder that is gone.").format(frappe.bold(label)))
            if kind == "category" and action.get("value") not in categories:
                frappe.throw(_("Rule {0} names a category that doesn't exist.").format(frappe.bold(label)))
            if any(a["type"] == kind for a in actions):
                continue
            actions.append(
                {"type": kind, "value": action["value"]} if kind in ("move", "category") else {"type": kind}
            )

        if not conditions:
            frappe.throw(_("Rule {0} needs a condition.").format(frappe.bold(label)))
        if not actions:
            frappe.throw(_("Rule {0} needs something to do.").format(frappe.bold(label)))
        if sum(a["type"] in FILING_ACTIONS for a in actions) > 1:
            frappe.throw(_("Rule {0} can file mail in one place only.").format(frappe.bold(label)))

        kept.append(
            {
                "id": raw["id"] if _ID.match(str(raw.get("id") or "")) else str(uuid7()),
                "name": name,
                "enabled": bool(raw.get("enabled", True)),
                "match": "any" if raw.get("match") == "any" else "all",
                "conditions": conditions,
                "actions": actions,
            }
        )
    return kept


def to_sieve(rule: Rule, mailboxes: list[dict], roles: Roles) -> str:
    """The Sieve that runs a rule."""

    tests = [_test(condition) for condition in rule["conditions"]]
    test = (
        tests[0]
        if len(tests) == 1
        else f"{'anyof' if rule['match'] == 'any' else 'allof'} ({', '.join(tests)})"
    )

    lines = [f"if {test} {{"]
    for action in rule["actions"]:
        if action["type"] == "mark_read":
            lines.append('  addflag "\\\\Seen";')
        elif action["type"] == "star":
            lines.append('  addflag "\\\\Flagged";')
        elif action["type"] == "category":
            # The classifier leaves mail that already carries a category alone, so the rule's stands.
            lines.append(f'  addflag "{Category(action["value"]).keyword}";')

    filing = next((a for a in rule["actions"] if a["type"] in FILING_ACTIONS), None)
    if filing:
        target = filing.get("value") if filing["type"] == "move" else roles.get(filing["type"])
        if target:
            # By id, so renaming or moving the folder doesn't lose the rule; by path should the id be
            # gone, and to the Inbox should both be.
            path = _escape(_path_of(target, mailboxes) or "INBOX")
            lines.append(f'  fileinto :mailboxid "{_escape(target)}" "{path}";')
        # Filed: no later rule, folder rule or gate decides again.
        lines.append("  stop;")
    lines.append("}")
    return "\n".join(lines)


def _test(condition: Condition) -> str:
    field, op, value = condition["field"], condition["op"], condition["value"]
    if field == "size":
        test = f"size :over {int(value)}K"
    elif field in ADDRESS_FIELDS:
        headers = {"from": '"from"', "to": '"to"', "cc": '"cc"', "to_or_cc": '["to", "cc"]'}[field]
        if op == "domain":
            test = f'address :domain :is {headers} "{_escape(value)}"'
        else:
            test = f'address :{op} {headers} "{_escape(value)}"'
    elif field == "body":
        test = f'body :text :{op} "{_escape(value)}"'
    else:
        header = {"subject": "subject", "list_id": "list-id"}[field]
        test = f'header :{op} "{header}" "{_escape(value)}"'
    return f"not {test}" if condition.get("negate") else test


def _path_of(mailbox_id: str, mailboxes: list[dict]) -> str | None:
    by_id = {mailbox["id"]: mailbox for mailbox in mailboxes}
    parts, seen = [], set()
    current = by_id.get(mailbox_id)
    while current and current["id"] not in seen:
        seen.add(current["id"])
        parts.append(current["_name"])
        current = by_id.get(current.get("parent_id"))
    return "/".join(reversed(parts)) or None


def _escape(value: str) -> str:
    return value.replace("\r", "").replace("\n", "").replace("\\", "\\\\").replace('"', '\\"')


def query_filter(rule: Rule) -> dict:
    """The JMAP Email/query filter for the mail already received that a rule would match: close to
    it, since the server searches words where the rule compares text."""

    conditions = []
    for condition in rule["conditions"]:
        field, value = condition["field"], condition["value"]
        if field == "size":
            test: dict = {"minSize": int(value) * 1024 + 1}
        elif field == "to_or_cc":
            test = {"operator": "OR", "conditions": [{"to": value}, {"cc": value}]}
        elif field in ADDRESS_FIELDS:
            test = {field: value}
        elif field == "list_id":
            test = {"header": ["List-Id", value]}
        else:
            test = {field: value}
        if condition.get("negate"):
            test = {"operator": "NOT", "conditions": [test]}
        conditions.append(test)
    if len(conditions) == 1:
        return conditions[0]
    return {"operator": "OR" if rule["match"] == "any" else "AND", "conditions": conditions}
