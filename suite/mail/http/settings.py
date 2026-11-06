"""Contracts for account settings and their named workflows."""

from collections.abc import Callable
from typing import Literal, NotRequired, TypedDict

import frappe

from suite.composition.http import Route, RouteKind
from suite.mail.api import account, mail, rules, sieve
from suite.mail.doctype.vacation_response import vacation_response
from suite.mail.http.shapes import AccountInput, Flag
from suite.mail.rules import Rule


class MailClientConfig(TypedDict):
    protocol: str
    hostname: str
    port: int
    connection_security: str


class Quota(TypedDict):
    disk_quota: int
    used_quota: int
    used_percentage: float


class Signature(TypedDict):
    identity: str
    signature: str


class AutomationRules(TypedDict):
    emails_from: str
    subject_contains: str
    match_if: Literal["any", "all"]
    mark_as_read: bool | Flag
    add_star: bool | Flag


class CreateMailbox(AccountInput):
    name: str
    parent: NotRequired[str | None]
    icon: NotRequired[str | None]
    color: NotRequired[str | None]
    disable_push_notification: NotRequired[bool]
    automation_rules: NotRequired[AutomationRules | None]


class UpdateMailbox(CreateMailbox):
    id: str
    old_name: str
    role: NotRequired[str | None]


class DeleteMailbox(AccountInput):
    id: str
    name: str


class ScreenAddress(AccountInput):
    email: str
    action: NotRequired[Literal["Spam", "Accepted"]]


class CreateScript(AccountInput):
    _name: str
    content: str
    active: bool


class UpdateScript(CreateScript):
    id: str


class DeleteScript(AccountInput):
    id: str


class CreateAutomation(AccountInput):
    active: NotRequired[bool]


class ScriptIncluded(AccountInput):
    id: str
    included: bool


class FolderRule(TypedDict):
    mailbox_id: str
    folder: str
    emails_from: str
    subject_contains: str
    match_if: str
    mark_as_read: bool
    add_star: bool


class RulesStanding(TypedDict):
    # A script of the person's own that is active instead of the rules, or "vacation".
    paused_by: str | None
    # The scripts of their own that run alongside the rules.
    own_scripts: list[str]


class Rules(RulesStanding):
    rules: list[Rule]
    folder_rules: list[FolderRule]


class SaveRules(AccountInput):
    rules: list[Rule]


class SavedRules(RulesStanding):
    rules: list[Rule]


class PreviewInput(AccountInput):
    rule: Rule


class DraftInput(AccountInput):
    message_id: str


class PreviewRow(TypedDict):
    id: str
    thread_id: str
    subject: str
    from_name: str
    from_email: str
    received_at: str


class Preview(TypedDict):
    total: int
    rows: list[PreviewRow]


class Vacation(TypedDict):
    account: str
    enabled: bool | Flag
    from_date: str | None
    to_date: str | None
    subject: str | None
    text_body: str | None
    html_body: str | None
    creation: str | None
    modified: str | None


class UpdateVacation(AccountInput):
    enabled: bool | Flag
    from_date: NotRequired[str | None]
    to_date: NotRequired[str | None]
    subject: NotRequired[str | None]
    text_body: NotRequired[str | None]
    html_body: NotRequired[str | None]


_OPERATIONS: tuple[tuple[Callable[..., object], RouteKind, str, object, object], ...] = (
    (account.get_mail_client_config, "query", "settings.clientConfig", None, list[MailClientConfig]),
    (account.get_quota, "query", "settings.quota", AccountInput, Quota),
    (account.set_signature, "mutation", "identities.setSignature", Signature, type(None)),
    (mail.create_mailbox, "mutation", "mailboxes.create", CreateMailbox, str),
    (mail.update_mailbox, "mutation", "mailboxes.update", UpdateMailbox, type(None)),
    (mail.delete_mailbox, "mutation", "mailboxes.delete", DeleteMailbox, type(None)),
    (mail.screen_email_address, "mutation", "screening.setAddress", ScreenAddress, type(None)),
    (sieve.create_sieve_script, "mutation", "sieve.create", CreateScript, type(None)),
    (sieve.update_sieve_script, "mutation", "sieve.update", UpdateScript, type(None)),
    (sieve.delete_sieve_script, "mutation", "sieve.delete", DeleteScript, type(None)),
    (sieve.set_sieve_script_included, "mutation", "sieve.setIncluded", ScriptIncluded, type(None)),
    (rules.get_rules, "query", "rules.list", AccountInput, Rules),
    (rules.save_rules, "mutation", "rules.save", SaveRules, SavedRules),
    (rules.preview_rule, "query", "rules.preview", PreviewInput, Preview),
    (rules.draft_rule, "query", "rules.draft", DraftInput, Rule),
    (sieve.create_automation_script, "mutation", "sieve.createAutomation", CreateAutomation, type(None)),
    (
        sieve.rebuild_automation_script_for_account,
        "mutation",
        "sieve.rebuildAutomation",
        AccountInput,
        type(None),
    ),
    (vacation_response.get_vacation_response, "query", "vacation.get", AccountInput, Vacation),
    (
        vacation_response.update_vacation_response,
        "mutation",
        "vacation.update",
        UpdateVacation,
        type(None),
    ),
)


CONTRACT_ROUTES = tuple(
    Route(
        "POST",
        f"/api/method/{handler.__module__}.{handler.__name__}",
        handler.__name__,
        id=handler.__name__,
        kind=kind,
        public_name=public_name,
        body=body,
        output=output,
        envelope="message",
        errors=(frappe.PermissionError, frappe.ValidationError),
    )
    for handler, kind, public_name, body, output in _OPERATIONS
)
