# Copyright (c) 2026, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from unittest import TestCase
from unittest.mock import patch

import frappe

from suite.mail import rules
from suite.mail.doctype.sieve_script import sieve_script

MAILBOXES = [
    {"id": "inbox", "_name": "Inbox", "parent_id": None},
    {"id": "clients", "_name": "Clients", "parent_id": None},
    {"id": "gold", "_name": "Gold", "parent_id": "clients"},
]
ROLES: rules.Roles = {"archive": "archive", "trash": "trash"}


def rule(**overrides) -> dict:
    return {
        "name": "Invoices",
        "match": "all",
        "conditions": [{"field": "from", "op": "is", "value": "billing@example.org"}],
        "actions": [{"type": "move", "value": "gold"}],
        **overrides,
    }


def blocks(content: str) -> list[str]:
    """The `if` blocks a script runs, one string each."""

    return [block.strip() for block in content.split("\nif ")[1:]]


class ReadingRulesBack(TestCase):
    def test_saved_rules_read_back_as_they_were_made(self):
        made = rules.clean(
            [
                rule(),
                rule(
                    name="Lists",
                    match="any",
                    conditions=[
                        {"field": "list_id", "op": "contains", "value": "dev.example.org"},
                        {"field": "subject", "op": "contains", "value": "naïve 🎉", "negate": True},
                    ],
                    actions=[{"type": "mark_read"}, {"type": "category", "value": "forums"}],
                ),
            ],
            MAILBOXES,
        )

        self.assertEqual(rules.read(rules.write(made, MAILBOXES, ROLES)), made)

    def test_a_switched_off_rule_is_kept_but_does_not_run(self):
        made = rules.clean([rule(enabled=False)], MAILBOXES)
        content = rules.write(made, MAILBOXES, ROLES)

        self.assertEqual(rules.read(content)[0]["enabled"], False)
        self.assertEqual(blocks(content), [])

    def test_lines_a_rule_did_not_write_are_passed_over(self):
        content = "\n".join(
            [
                "# suite-rule not json",
                '# suite-rule {"name": "no id"}',
                "# a comment of the person's own",
                "keep;",
                '# suite-rule {"id": "r1", "name": "Kept", "enabled": true, "match": "all", "conditions": [], "actions": []}',
            ]
        )

        self.assertEqual([r["name"] for r in rules.read(content)], ["Kept"])


class WhatARuleDoes(TestCase):
    def sieve(self, **overrides) -> str:
        return rules.to_sieve(rules.clean([rule(**overrides)], MAILBOXES)[0], MAILBOXES, ROLES)

    def test_moving_files_by_folder_id_with_its_path_to_fall_back_on_and_ends_the_rules(self):
        sieve = self.sieve()

        self.assertIn('fileinto :mailboxid "gold" "Clients/Gold";', sieve)
        self.assertTrue(sieve.rstrip("}\n ").endswith("stop;"))

    def test_a_rule_that_does_not_file_lets_later_rules_and_folders_act(self):
        sieve = self.sieve(actions=[{"type": "mark_read"}, {"type": "star"}])

        self.assertIn('addflag "\\\\Seen";', sieve)
        self.assertIn('addflag "\\\\Flagged";', sieve)
        self.assertNotIn("stop;", sieve)
        self.assertNotIn("fileinto", sieve)

    def test_archive_and_trash_file_into_the_accounts_own_folders(self):
        self.assertIn('fileinto :mailboxid "archive"', self.sieve(actions=[{"type": "archive"}]))
        self.assertIn('fileinto :mailboxid "trash"', self.sieve(actions=[{"type": "trash"}]))

    def test_a_category_is_set_as_the_keyword_the_classifier_respects(self):
        sieve = self.sieve(actions=[{"type": "category", "value": "promotions"}])

        self.assertIn('addflag "category_promotions";', sieve)

    def test_conditions_join_by_all_or_any(self):
        two = [
            {"field": "from", "op": "domain", "value": "@example.org"},
            {"field": "size", "op": "over", "value": "500"},
        ]

        self.assertIn(
            'if allof (address :domain :is "from" "example.org", size :over 500K)', self.sieve(conditions=two)
        )
        self.assertIn("if anyof (", self.sieve(conditions=two, match="any"))

    def test_to_or_cc_checks_both(self):
        sieve = self.sieve(conditions=[{"field": "to_or_cc", "op": "contains", "value": "team"}])

        self.assertIn('address :contains ["to", "cc"] "team"', sieve)

    def test_a_typed_value_cannot_break_out_of_its_string(self):
        sieve = self.sieve(
            conditions=[{"field": "subject", "op": "contains", "value": 'a"; discard;\nkeep; \\'}]
        )

        self.assertIn('header :contains "subject" "a\\"; discard; keep; \\\\"', sieve)
        self.assertEqual(sieve.count("\n"), 3)


class RefusingARuleThatCannotRun(TestCase):
    def refuses(self, **overrides):
        with self.assertRaises(frappe.ValidationError):
            rules.clean([rule(**overrides)], MAILBOXES)

    def test_refused(self):
        self.refuses(conditions=[])
        self.refuses(actions=[])
        self.refuses(conditions=[{"field": "from", "op": "is", "value": "  "}])
        self.refuses(conditions=[{"field": "size", "op": "over", "value": "big"}])
        self.refuses(conditions=[{"field": "subject", "op": "domain", "value": "x"}])
        self.refuses(actions=[{"type": "move", "value": "deleted-folder"}])
        self.refuses(actions=[{"type": "category", "value": "spam"}])
        self.refuses(actions=[{"type": "move", "value": "gold"}, {"type": "archive"}])

    def test_an_id_that_could_not_be_kept_is_replaced(self):
        kept = rules.clean([rule(id="x\n# suite-rule {}")], MAILBOXES)[0]

        self.assertRegex(kept["id"], r"^[\w-]+$")


class TheAutomationScript(TestCase):
    """The account's active script: the person's rules first, then folder rules, Spam, the scripts
    they wrote themselves, and the Screening gate last."""

    def build(self, own_scripts: list[str]) -> str:
        screened = [frappe._dict(email="spammer@example.org", action="Spam")]
        folder_rule = {
            "emails_from": "team@example.org",
            "subject_contains": "",
            "match_if": "any",
            "mark_as_read": False,
            "add_star": False,
        }
        with (
            patch.object(sieve_script, "get_mailboxes", return_value=[{"id": "m1", "_name": "Team"}]),
            patch.object(sieve_script, "get_mailbox_automation_rules", return_value=folder_rule),
            patch.object(sieve_script, "get_mailbox_path", return_value="Team"),
            patch.object(sieve_script, "get_effective_screened_email_addresses", return_value=screened),
            patch.object(sieve_script, "get_junk_mailbox_path", return_value="Junk"),
            patch.object(sieve_script, "is_screening_enabled", return_value=True),
            patch.object(sieve_script, "get_inbox_mailbox_path", return_value="INBOX"),
            patch.object(sieve_script, "get_account_emails", return_value=["me@example.org"]),
        ):
            return sieve_script._build_automation_content("account", own_scripts)

    def test_runs_in_order(self):
        content = self.build(['my "filters"'])
        order = [
            content.index('include :personal :optional "suite_rules";'),
            content.index('fileinto "Team"'),
            content.index("# Spam Senders"),
            content.index('include :personal :optional "my \\"filters\\"";'),
            content.index("# Screening"),
        ]

        self.assertEqual(order, sorted(order))

    def test_the_scripts_it_runs_are_read_back_from_it(self):
        content = self.build(['my "filters"', "older"])

        self.assertEqual(sieve_script.get_own_scripts(content), ['my "filters"', "older"])

    def test_a_rebuild_keeps_the_scripts_it_ran(self):
        doc = frappe._dict(content=self.build(["mine"]), active=1, save=lambda: None)
        with (
            patch.object(sieve_script, "get_user_for_jmap_account", return_value="u@example.org"),
            patch.object(sieve_script.frappe, "get_cached_value", return_value=1),
            patch.object(sieve_script, "get_automation_script_name", return_value="account|1"),
            patch.object(sieve_script.frappe, "get_doc", return_value=doc),
            patch.object(sieve_script, "_build_automation_content", side_effect=lambda a, own: own) as build,
        ):
            sieve_script.build_automation_sieve("account", raise_exception=True)

        self.assertEqual(build.call_args.args[1], ["mine"])

    def test_activating_over_a_script_of_their_own_runs_it_instead_of_switching_it_off(self):
        doc = frappe._dict(content=self.build([]), active=0, save=lambda: None)
        with (
            patch.object(sieve_script, "get_user_for_jmap_account", return_value="u@example.org"),
            patch.object(sieve_script.frappe, "get_cached_value", return_value=1),
            patch.object(sieve_script, "get_automation_script_name", return_value="account|1"),
            patch.object(sieve_script.frappe, "get_doc", return_value=doc),
            patch.object(sieve_script, "get_active_own_script_name", return_value="handwritten"),
            patch.object(sieve_script, "is_vacation_script_active", return_value=False),
            patch.object(sieve_script, "_build_automation_content", side_effect=lambda a, own: own) as build,
        ):
            active = sieve_script.build_automation_sieve("account", activate=True, raise_exception=True)

        self.assertTrue(active)
        self.assertEqual(build.call_args.args[1], ["handwritten"])

    def test_a_vacation_response_keeps_it_waiting(self):
        doc = frappe._dict(content=self.build([]), active=0, save=lambda: None)
        with (
            patch.object(sieve_script, "get_user_for_jmap_account", return_value="u@example.org"),
            patch.object(sieve_script.frappe, "get_cached_value", return_value=1),
            patch.object(sieve_script, "get_automation_script_name", return_value="account|1"),
            patch.object(sieve_script.frappe, "get_doc", return_value=doc),
            patch.object(sieve_script, "get_active_own_script_name", return_value=None),
            patch.object(sieve_script, "is_vacation_script_active", return_value=True),
            patch.object(sieve_script, "_build_automation_content", return_value=""),
        ):
            active = sieve_script.build_automation_sieve("account", activate=True, raise_exception=True)

        self.assertFalse(active)


class MatchingMailAlreadyReceived(TestCase):
    def test_the_preview_asks_for_what_the_rule_would_match(self):
        made = rules.clean(
            [
                rule(
                    match="any",
                    conditions=[
                        {"field": "to_or_cc", "op": "contains", "value": "team@example.org"},
                        {"field": "size", "op": "over", "value": "1"},
                        {"field": "subject", "op": "contains", "value": "draft", "negate": True},
                    ],
                )
            ],
            MAILBOXES,
        )[0]

        self.assertEqual(
            rules.query_filter(made),
            {
                "operator": "OR",
                "conditions": [
                    {
                        "operator": "OR",
                        "conditions": [{"to": "team@example.org"}, {"cc": "team@example.org"}],
                    },
                    {"minSize": 1025},
                    {"operator": "NOT", "conditions": [{"subject": "draft"}]},
                ],
            },
        )
