# Copyright (c) 2026, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt
"""What muting a conversation does to the mail in it, and to what arrives later: replies skip the
Inbox read and silently, unless one of the person's addresses is in To."""

import unittest
from unittest import mock

from suite.mail import muting
from suite.mail.doctype.mail_message import mail_message
from suite.mail.tests.test_mail_push_sync import ACCOUNT, USER, _changes, _client, _server

ROLES = {
    "inbox": "inbox",
    "archive": "archive",
    "sent": "sent",
    "drafts": "drafts",
    "junk": "junk",
    "trash": "trash",
}
MAILBOXES = [{"id": id, "role": role, "isSubscribed": True} for role, id in {**ROLES, "": "receipts"}.items()]


def message(id="e2", to=("someone@example.com",), cc=(USER,), folder="inbox", **fields) -> dict:
    return {
        "id": id,
        "draft": 0,
        "seen": 0,
        "keywords": "{}",
        "mailboxes": [{"mailbox_id": folder}],
        "from_name": "Ana",
        "from_email": "ana@example.com",
        "subject": "Re: Plans",
        "thread_id": "t1",
        "recipients": [
            *({"type": "To", "email": address} for address in to),
            *({"type": "Cc", "email": address} for address in cc),
        ],
        "text_body": "Plans",
        "_text_body": [],
        "attachments": [],
        **fields,
    }


class NewMailInAMutedConversation(unittest.TestCase):
    """`fetch_changes`, against a fake server holding one muted conversation."""

    def arrive(self, *arriving, muted=("e2",), own=(USER,), refuse=False, query_fails=False):
        """Runs `fetch_changes` over the arriving mail. Returns what was written to the server, the
        pushes sent, and the realtime events published."""

        server = _server()
        server.respond("Email/changes", _changes(created=[m["id"] for m in arriving]))
        if query_fails:
            server.fail("Email/query", "serverFail")
        else:
            server.respond("Email/query", {"accountId": ACCOUNT, "ids": list(muted), "position": 0})

        written: dict[str, dict] = {}

        def email_set(arguments, _server):
            if refuse:
                return {
                    "accountId": ACCOUNT,
                    "newState": "s3",
                    "notUpdated": {id: {"type": "forbidden"} for id in arguments["update"]},
                }
            written.update(arguments["update"])
            return {"accountId": ACCOUNT, "newState": "s3", "updated": dict.fromkeys(arguments["update"])}

        server.handle("Email/set", email_set)
        pn = mock.Mock()
        pn.return_value.is_enabled.return_value = True

        with (
            mock.patch.object(mail_message, "get_sync_state", return_value="s1"),
            mock.patch.object(mail_message, "update_sync_state"),
            mock.patch.object(mail_message, "get_jmap_client", return_value=_client(server)),
            mock.patch.object(mail_message, "get_messages", return_value=list(arriving)),
            mock.patch.object(mail_message, "get_cached_mailboxes", return_value=MAILBOXES),
            mock.patch.object(mail_message.frappe.db, "get_all", return_value=[]),
            mock.patch.object(mail_message.frappe.utils, "get_url", return_value="https://x"),
            mock.patch.object(mail_message, "get_config", return_value=5),
            mock.patch.object(mail_message, "PushNotification", pn),
            mock.patch.object(mail_message.frappe, "publish_realtime") as publish_realtime,
            mock.patch.object(muting, "own_addresses", return_value={muting.normalized(a) for a in own}),
            mock.patch.object(muting, "log_mail_error"),
        ):
            mail_message.fetch_changes(USER, ACCOUNT, email_state="s2")

        return written, pn.return_value.send_notification_to_user, publish_realtime

    def test_a_reply_you_are_copied_on_skips_the_inbox_read_and_silently(self):
        written, push, realtime = self.arrive(message())

        self.assertEqual(
            written["e2"],
            {
                "keywords/$seen": True,
                "keywords/$muted": True,
                "mailboxIds/inbox": None,
                "mailboxIds/archive": True,
            },
        )
        push.assert_not_called()
        realtime.assert_not_called()

    def test_a_reply_with_you_in_to_stays_in_the_inbox_and_notifies(self):
        written, push, realtime = self.arrive(message(to=(USER,), cc=()))

        self.assertEqual(written, {})
        push.assert_called_once()
        realtime.assert_called_once_with("new_mail_created", ["inbox"], user=USER)

    def test_an_alias_in_to_counts_as_you(self):
        written, push, _realtime = self.arrive(
            message(to=("sales@example.test",), cc=()), own=(USER, "sales@example.test")
        )

        self.assertEqual(written, {})
        push.assert_called_once()

    def test_a_second_identity_in_to_counts_however_it_is_written(self):
        for written_as in ("Second@Example.Test", "second+lists@example.test"):
            with self.subTest(written_as):
                written, push, _realtime = self.arrive(
                    message(to=(written_as,), cc=()), own=(USER, "second@example.test")
                )

                self.assertEqual(written, {})
                push.assert_called_once()

    def test_an_address_of_yours_only_in_cc_does_not_count(self):
        written, push, _realtime = self.arrive(
            message(to=("everyone@example.test",), cc=("second@example.test",)),
            own=(USER, "second@example.test"),
        )

        self.assertIn("e2", written)
        push.assert_not_called()

    def test_someone_elses_plus_tag_of_a_similar_name_does_not_count(self):
        written, push, _realtime = self.arrive(message(to=("user2+tag@example.test",), cc=()), own=(USER,))

        self.assertIn("e2", written)
        push.assert_not_called()

    def test_mail_in_another_conversation_is_delivered_as_usual(self):
        written, push, realtime = self.arrive(message(id="e9"), muted=("e2",))

        self.assertEqual(written, {})
        push.assert_called_once()
        realtime.assert_called_once_with("new_mail_created", ["inbox"], user=USER)

    def test_mail_a_rule_filed_elsewhere_stays_there_but_goes_quiet(self):
        written, push, _realtime = self.arrive(message(folder="receipts"))

        self.assertEqual(written["e2"], {"keywords/$seen": True, "keywords/$muted": True})
        push.assert_not_called()

    def test_junk_in_a_muted_conversation_is_left_in_junk(self):
        written, _push, _realtime = self.arrive(message(folder="junk"))

        self.assertEqual(written, {})

    def test_when_the_server_cant_say_what_is_muted_mail_is_delivered_as_usual(self):
        written, push, realtime = self.arrive(message(), query_fails=True)

        self.assertEqual(written, {})
        push.assert_called_once()
        realtime.assert_called_once_with("new_mail_created", ["inbox"], user=USER)

    def test_mail_the_server_would_not_change_is_delivered_as_usual(self):
        _written, push, realtime = self.arrive(message(), refuse=True)

        push.assert_called_once()
        realtime.assert_called_once_with("new_mail_created", ["inbox"], user=USER)

    def test_a_reaction_in_a_muted_conversation_stays_a_reaction(self):
        reaction = message(
            attachments=[{"filename": None, "type": "text/vnd.google.email-reaction+json"}],
            text_body="\U0001f602",
            in_reply_to="original@example.com",
        )
        with mock.patch.object(mail_message, "try_set_seen") as try_set_seen:
            written, push, _realtime = self.arrive(reaction)

        # Read as any reaction is, but not carried off to Archive: it marks a message in the thread.
        self.assertEqual(written, {})
        try_set_seen.assert_called_once_with(ACCOUNT, ["e2"], True)
        push.assert_not_called()


class Mute(unittest.TestCase):
    def email(self, id, boxes, **keywords):
        return {"id": id, "mailboxIds": dict.fromkeys(boxes, True), "keywords": keywords}

    def test_the_inboxs_mail_goes_to_archive_marked_read(self):
        updates = muting.plan_mute([self.email("e1", ["inbox"])], ROLES)

        self.assertEqual(
            updates["e1"],
            {
                "keywords/$muted": True,
                "keywords/$seen": True,
                "mailboxIds/inbox": None,
                "mailboxIds/archive": True,
            },
        )

    def test_mail_in_your_own_folder_keeps_its_place_and_read_state(self):
        updates = muting.plan_mute([self.email("e1", ["receipts"])], ROLES)

        self.assertEqual(updates["e1"], {"keywords/$muted": True})

    def test_your_sent_mail_stays_in_sent(self):
        updates = muting.plan_mute([self.email("e1", ["sent"], **{"$seen": True})], ROLES)

        self.assertEqual(updates["e1"], {"keywords/$muted": True})

    def test_a_draft_is_left_alone(self):
        updates = muting.plan_mute([self.email("e1", ["drafts"], **{"$draft": True})], ROLES)

        self.assertEqual(updates, {})


class Unmute(unittest.TestCase):
    def email(self, id, boxes, **keywords):
        return {"id": id, "mailboxIds": dict.fromkeys(boxes, True), "keywords": keywords}

    def test_unmuting_clears_the_keyword_on_every_message_and_leaves_the_mail_where_it_is(self):
        updates = muting.plan_unmute(
            [self.email("e1", ["archive"], **{"$muted": True}), self.email("e2", ["inbox"])], ROLES
        )

        self.assertEqual(updates, {"e1": {"keywords/$muted": None}})

    def test_back_to_inbox_returns_archives_mail(self):
        updates = muting.plan_unmute(
            [self.email("e1", ["archive"], **{"$muted": True})], ROLES, back_to_inbox=True
        )

        self.assertEqual(
            updates["e1"],
            {"keywords/$muted": None, "mailboxIds/archive": None, "mailboxIds/inbox": True},
        )

    def test_undo_marks_unread_only_the_mail_muting_read(self):
        updates = muting.plan_unmute(
            [
                self.email("e1", ["archive"], **{"$muted": True, "$seen": True}),
                self.email("e2", ["archive"], **{"$muted": True, "$seen": True}),
            ],
            ROLES,
            mark_unread=["e1"],
        )

        self.assertEqual(updates["e1"]["keywords/$seen"], None)
        self.assertNotIn("keywords/$seen", updates["e2"])


class OwnAddresses(unittest.TestCase):
    def test_every_address_mail_reaches_the_account_at_counts(self):
        with (
            mock.patch.object(muting, "get_account_emails", return_value=["identity@example.test"]),
            mock.patch.object(
                muting, "_directory_addresses", return_value=["Login@example.test", "alias@example.test"]
            ),
        ):
            self.assertEqual(
                muting.own_addresses(ACCOUNT),
                {"identity@example.test", "login@example.test", "alias@example.test"},
            )
