# Sent mail shows as unread

Date: 2026-10-09. Answers [ticket 007](../tickets/007-sent-mail-shows-unread.md).

## Method

- Live data: read-only JMAP queries against site su1 (accounts `ih`, `q9`, `te`) through `suite.mail.jmap.get_account_client`, run as a throwaway `bench --site su1 execute` module that has since been deleted. Nothing was written. This note gives only categories and domains, never subjects, bodies or full addresses.
- Code: the current tree (`suite/`, `frontend/src/apps/mail/`), and archived `frappe/mail` history fetched with `gh api` to see what the composer did when the old mail was sent.
- Server: Stalwart source (`stalwartlabs/stalwart` on GitHub), stalw.art docs, and RFC 8621.
- Competitors: vendor help pages where they say anything. Most say nothing about Sent counts, and those claims are marked as observed behaviour.

## What the 24 on `ih` are

`ih` Sent: 165 emails, `unreadEmails` 24, `unreadThreads` 24. `q9` and `te` Sent: 0 unread.

| Property | The 24 unseen Sent emails |
|---|---|
| Keywords | **None at all**: no `$seen` and no `$draft` |
| Mailboxes | Sent only |
| Threads | 24 threads, one email each (no replies, no Inbox copy) |
| receivedAt | 3 in Dec 2025, 15 in Jan 2026, 2 in Feb 2026, 1 on 2026-06-19 (plus 3 more in Dec 2025, below). Nothing after June 2026 |
| Origin, 21 of them | `X-Mailer: Frappe Mail`, `User-Agent: Frappe Mail v0.0.1 / v0.2.1`, an `X-Mail-Queue` header, Message-ID host equal to the sender's domain. These are the old composer's submissions (`build_email_draft`, `suite/mail/jmap.py:1036`) |
| Origin, 3 of them (Dec 2025) | No Frappe headers, Message-ID host `mail.local`. These are raw messages from another Frappe site or client, not the composer's draft path |
| Calendar | None has a `text/calendar` part |
| Received headers | 0, so none came in from outside |
| Frappe record | No Mail Queue row for any of them. su1 keeps 1 Mail Queue row in total (2026-10-07), so earlier rows have been cleared and this proves nothing either way |
| Imports | su1 has no Mail Exchange imports. The only two records are exports (2026-08-25) |

Meanwhile every other Sent copy on `ih` has `$seen`: 141 of them, including all mail since 2026-06-20. The calendar invitations in Sent have it too: 28 on `ih` and 6 on `q9`, sent July–August 2026.

### Which path explains the 24

The keywords left on them are what the composer leaves behind, minus `$seen`. When the composer created the draft it set `{"$draft", "$seen"}`, and moving it to Sent set `$seen` again:

- old `frappe/mail` `mail/jmap.py@25102cac9` (2025-12-03): lines 741 and 832 set `"keywords": {"$draft": True, "$seen": True}`, and line 924 sets `"keywords/$seen": True` in `onSuccessUpdateEmail`
- `$seen` on the Sent move arrived with frappe/mail PR #328 (merged 2025-11-19). Every one of the 24 was sent after that.
- today: `suite/mail/jmap.py:1066` and `suite/mail/doctype/mail_queue/mail_queue.py:775` (draft), and `mail_queue.py:815-821` (Sent move)

A message that went through that path and ended in Sent ends with exactly `{$seen}`. To end with `{}`, `$seen` must have been removed later by an explicit mark-unread on those messages: from Suite's (or the old app's) UI, or from an IMAP client clearing `\Seen`. That fits the evidence: single-message threads that exist only in Sent, clustered in the Dec 2025–Feb 2026 period when the account was used to test the old app. Stalwart keeps no keyword history, so which client did it can't be proven. **It wasn't calendar mail, an import or an SMTP client.** It is stale state on an old test account.

## Paths that can put an unseen copy in Sent

| Path | Unseen in Sent? | Evidence |
|---|---|---|
| Suite composer, Outbox resubmit, raw API (`send_raw`) | No. Draft created with `$seen`, Sent move sets `$seen` | `suite/mail/jmap.py:1066`; `mail_queue.py:775`, `mail_queue.py:815-821`; `suite/mail/api/outbound.py:312` goes through the same Mail Queue |
| Scheduled send and Undo send | No. `onSuccessUpdateEmail` applies when the submission is created, even while it is held. Undo moves the mail back to Drafts and keeps its flags | `mail_queue.py:832-845` (`hold_until`); `suite/mail/api/scheduled.py:877-883` |
| **Mark as Unread on a conversation** | **Yes, live today.** It un-seens every message in the thread across all mailboxes, including your own replies in Sent | `frontend/src/apps/mail/utils/useThreadActions.ts:584-586` ("Seen applies to the whole conversation (every mailbox)"); `components/MailThread.vue:898-904`; server `suite/mail/doctype/mail_message/mail_message.py:1150-1157` |
| **Mark Unread from Here** | **Yes, live today.** It leaves out drafts but not your own messages | `frontend/src/apps/mail/components/MailActions.vue` `handleMarkUnreadFromHere` (`.filter((m) => !m.draft)`) |
| Mark as unread on a Sent row | Yes, by design (the user asked for it) | same endpoint, `suite/mail/api/mail.py:1096` |
| Import, Maildir | Yes, for files in `new/` or without the `S` flag | `suite/mail/doctype/mail_exchange/mail_exchange.py:286-305` |
| Import, EML/MBOX | Depends on the metadata. Through the UI the copies always end up seen, because only the keyword names are read and the value is ignored: `{"$seen": false}` still imports as seen (a separate bug) | `suite/mail/api/account.py:474`; `mail_exchange.py:191`, `mail_exchange.py:254` (`set(metadata["keywords"].keys())`) |
| Import, JMAP format | Copies the keywords from the export, so unseen stays unseen | `mail_exchange.py:1019` |
| Calendar invites and RSVPs (Suite custom templates) | No. Since 2026-08-23 the sender's copy is destroyed after submission. Before that it was filed with `$seen` (the 28 + 6 above) | `suite/calendar/doctype/calendar_event/invitations.py:250-255`, `invitations.py:323-328`; commit `6b744429c` |
| Calendar via Stalwart's own iMIP | Never filed in Sent. Stalwart hands the iTIP mail straight to its SMTP queue | Stalwart `crates/services/src/task_manager/imip.rs:275` (`session.queue_message()`); [stalw.art scheduling](https://stalw.art/docs/collaboration/scheduling/) says only that it "falls back to iMIP" |
| Another client over SMTP + IMAP | Up to that client. Stalwart doesn't save SMTP submissions to Sent; the client APPENDs its own copy, usually with `\Seen` | server-side copies are only a [feature request](https://support.stalw.art/t/server-side-copy-sent-items-for-group-mailboxes/41) |
| Mail to yourself | No. The Sent copy is seen; the delivered copy goes to Inbox as a separate unseen email | `frontend/src/apps/mail/utils/mailCopies.ts:3-19` |

## How the Sent count is computed

- The sidebar shows `mailbox.unread_threads` for every subscribed mailbox, Sent included: `frontend/src/apps/mail/components/AppSidebar.vue:303` (account) and `AppSidebar.vue:341` (All accounts, summed in `suite/mail/api/mail.py:574`). The value is the JMAP `Mailbox.unreadThreads` (`suite/mail/doctype/mailbox/mailbox.py:466`).
- RFC 8621 §2 defines `unreadThreads` as threads where "at least one Email in the Thread has neither the "$seen" nor the "$draft" keyword AND at least one Email in the Thread is in this Mailbox" ([RFC 8621](https://www.rfc-editor.org/rfc/rfc8621.html#section-2)). On a server that follows the RFC, **an unread reply in Inbox lights up Sent** for every thread you've written in.
- Stalwart counts something narrower: the threads of emails *in this mailbox* that lack `$seen` (`crates/jmap/src/mailbox/get.rs:128-135`, `in_mailbox_without_keyword(document_id, &Keyword::Seen)`). On su1 an Inbox reply doesn't count toward Sent, which matches 24 emails = 24 threads, but an unseen Sent copy does. Stalwart also ignores `$draft` here.

## What other clients do with Sent counts

- No vendor documents a Sent-specific rule. They all show per-folder unread counts and count on sent copies being stored as read, so Sent normally shows nothing.
- **Gmail** (observed): the Sent label shows no count, because sending never applies `UNREAD`. Labels can be set to "show if unread" ([Gmail API Label resource](https://developers.google.com/gmail/api/reference/rest/v1/users.labels)). Drafts shows a total, not an unread count.
- **Fastmail**: "the folder list shows your folders and a count of the unread messages in each folder" ([Fastmail help](https://www.fastmail.help/hc/en-us/articles/1500000280301-Setting-up-and-using-folders), via a search extract). There is no Sent exception, and it relies on sent copies being saved seen.
- **Apple Mail**: badges any mailbox that has unread mail. Users report Sent showing unread when copies come in without `\Seen` ([Apple Community thread](https://discussionskorea.apple.com/thread/250657850)). The Dock badge counts Primary, or all mailboxes by setting ([Mail guide](https://support.apple.com/guide/mail/mlhl7fa3a90d/mac)).
- **eM Client**: users report Sent items in the "Unread" smart folder as a bug ([forum](https://forum.emclient.com/t/unread-smart-folder-sent-items-and-trash-also-count-as-unread-messages/49948)).
- Takeaway: wherever an unread count shows on Sent, users file it as a bug. Nobody treats it as information.

## Underlying problem

Suite treats "seen" on mail you wrote yourself as ordinary, changeable state. Conversation-level unread actions, imports and other clients can strip it, and the sidebar then shows a count on Sent that means nothing to the user. The 24 on `ih` are leftovers of exactly that, not a sending bug.

## Decision options (no implementation)

1. **Make your own mail exempt from unread actions.** Mark as Unread and Mark Unread from Here skip messages from you, or messages in Sent. This keeps `$seen` on Sent true from now on. It is the root fix for Suite's own paths.
2. **Show no unread count on Sent** (and decide the same for Drafts, Trash and Junk) in both sidebars. This also covers other clients, imports and RFC-compliant `unreadThreads`. It is UI only; unseen rows stay bold in the Sent list.
3. **Always render your own messages as read.** No bold or unread dot on Sent rows, and the unread-from-here marker skips your own messages. This makes the keyword irrelevant for display.
4. **Clean up existing data**: a one-off patch or a "mark all read" that sets `$seen` on unseen Sent copies. Make imports into Sent default to seen, and fix the ignored `seen=false` on EML/MBOX imports as a separate bug.
5. **Combine**: 1 + 2 (+ 4 for old accounts). This closes Suite's own source and hides the cases Suite can't control.
