import frappe
from frappe import _
from frappe.utils import cint

from suite.mail.doctype.sieve_script.sieve_script import (
    AUTOMATION_SCRIPT_NAME,
    SieveScript,
    build_automation_sieve,
    get_own_scripts,
)


@frappe.whitelist()
def get_sieve_scripts(account: str) -> list[dict]:
    """Return the sieve scripts for the account.

    `included` marks a script of the person's own that runs alongside the rules, from the automation
    script, as opposed to `active`, the one script the server runs itself.
    """

    ids = [d["id"] for d in SieveScript._fetch_sieve_scripts(account)[0]]
    scripts = SieveScript._get_sieve_scripts(account, ids, True)
    automation = next((s for s in scripts if s["_name"] == AUTOMATION_SCRIPT_NAME), None)
    own = set(get_own_scripts(automation["content"] if automation else ""))
    return [{**script, "included": cint(script["_name"] in own)} for script in scripts]


@frappe.whitelist()
def create_sieve_script(account: str, _name: str, content: str, active: bool) -> None:
    """Create a sieve script for the account. Turned on, it runs alongside the rules."""

    SieveScript._add_sieve_script(account, _name, content)
    if active:
        build_automation_sieve(account, activate=True, raise_exception=True, own_scripts={_name: True})


@frappe.whitelist()
def update_sieve_script(account: str, id: str, _name: str, content: str, active: bool = False) -> None:
    """Update a sieve script for the account, and whether it runs alongside the rules."""

    current = _script(account, id)
    if current["_name"] == AUTOMATION_SCRIPT_NAME:
        # Turning the automation script on runs a script the person turned on by hand from it, rather
        # than switching that off.
        if active:
            build_automation_sieve(account, activate=True, raise_exception=True)
        else:
            SieveScript._update_sieve_script(account, id, _name, content, active=False)
        return

    # A script still active by itself, from before scripts ran alongside the rules, stays so until the
    # automation script runs it: switching it off first would leave the account with no filtering.
    SieveScript._update_sieve_script(account, id, _name, content, active=bool(current["active"]) and active)
    changes = {current["_name"]: False, _name: bool(active)}
    # Switched off, such a script hands the mail back to the automation script.
    if active or current["active"] or current["_name"] != _name or _included(account, current["_name"]):
        build_automation_sieve(
            account, activate=bool(active or current["active"]), raise_exception=True, own_scripts=changes
        )


@frappe.whitelist()
def set_sieve_script_included(account: str, id: str, included: bool) -> None:
    """Turn a script of the person's own on or off, alongside the rules."""

    script = _script(account, id)
    if script["read_only"] or script["_name"] == AUTOMATION_SCRIPT_NAME:
        frappe.throw(_("The '{0}' sieve script cannot be modified.").format(script["_name"]))
    # A script still active by itself, from before scripts ran alongside the rules, is switched off by
    # making the automation script active again, which leaves it out.
    build_automation_sieve(
        account,
        activate=bool(included or script["active"]),
        raise_exception=True,
        own_scripts={script["_name"]: bool(included)},
    )


@frappe.whitelist()
def delete_sieve_script(account: str, id: str) -> None:
    """Delete a sieve script for the account"""

    script = _script(account, id)
    if _included(account, script["_name"]):
        build_automation_sieve(account, raise_exception=True, own_scripts={script["_name"]: False})
    SieveScript._delete_sieve_scripts(account, [id])


@frappe.whitelist()
def create_automation_script(account: str, active: bool = False) -> None:
    """Create (and optionally activate) the frappe_mail_automation sieve script for the account.

    Backs the "Enable Folder Automation" action. Delegates to `build_automation_sieve`, which creates
    the script if it doesn't exist and regenerates all four sections from their persistent backups
    (Mailbox Settings + Screened Email Address).
    """

    build_automation_sieve(account, activate=active)


@frappe.whitelist()
def rebuild_automation_script_for_account(account: str) -> None:
    """Rebuild the frappe_mail_automation script from its backups for the session account.

    Backs the manual "Rebuild Automation" action, for when the script was deleted or edited by a
    third-party client.
    """

    build_automation_sieve(account)


def _script(account: str, id: str) -> dict:
    if scripts := SieveScript._get_sieve_scripts(account, [id]):
        return scripts[0]
    frappe.throw(
        _("Sieve Script with ID {0} not found.").format(frappe.bold(id)), title=_("Sieve Script Not Found")
    )


def _included(account: str, name: str) -> bool:
    scripts, _total = SieveScript._fetch_sieve_scripts(account, {"name": AUTOMATION_SCRIPT_NAME}, limit=1)
    if not scripts:
        return False
    automation = SieveScript._get_sieve_scripts(account, [scripts[0]["id"]], download_content=True)
    return bool(automation) and name in get_own_scripts(automation[0]["content"])
