---
id: 007
title: Sent mail shows as unread
label: wayfinder:research
status: open
assignee:
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
