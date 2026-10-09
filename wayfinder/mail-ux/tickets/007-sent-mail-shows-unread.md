---
id: 007
title: Sent mail shows as unread
label: wayfinder:research
status: closed
assignee: claude (agent, 2026-10-09)
blocked-by: []
---

## Question

Why does mail you sent show as unread, and where does it come from? Mail
sent from Suite's composer is marked seen when it lands in Sent (the
submission's onSuccessUpdateEmail sets `$seen`), yet on 2026-10-09 the
account `ih` on su1 had 24 unread messages in Sent and the sidebar showed
the count. Find which paths put unseen copies in Sent (calendar invitations
sent by the server, mail sent from another client over SMTP, scheduled
sends, mail to yourself, imports), and whether an unread count on Sent means
anything to a user at all. Findings go in `references/sent-unread.md`.

Source: the user's pain list (2026-10-09).

## Answer

Resolved 2026-10-09 by a research agent:
[references/sent-unread.md](../references/sent-unread.md).

The 24 on `ih` are old (December 2025 to June 2026), each alone in Sent with
no keywords. They were sent read and later marked unread by some action;
which one can't be proven. Paths that still make your own mail unread today:
Mark as Unread on a conversation un-reads your own messages in it, Mark
Unread from Here does too, and some imports file unread copies in Sent. The
sidebar shows an unread count on Sent; no competitor documents one, and
users report it as a bug where it appears.

Underlying problem: Suite lets actions make mail you wrote unread, and then
counts it. Options for a follow-up decision: exempt your own mail from
unread actions, show no count on Sent, always treat your own mail as read,
clean up existing data, or a mix.
