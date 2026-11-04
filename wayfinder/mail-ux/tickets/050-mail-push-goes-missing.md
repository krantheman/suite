---
id: 050
title: Mail push notifications go missing
label: wayfinder:research
status: open
assignee:
blocked-by: []
---

## Question

Mail's push notifications are unreliable, so mail gets missed (Raghav Ruia, in
chat, passed on by the user 2026-11-04: "Mail push notifications are unreliable,
pls do something about it - can't be missing emails."). Find out where they get
lost, and fix that. This is a fault to diagnose, not a preference:
[Notifications for the mail you care about](024-notifications.md) decides what
should notify; this one is about a notification that should have arrived and
didn't.

Priority is the user's to set.

## Not known yet

- Which device and browser, installed or in a tab, and on which site.
- How often, and whether it is every mail or only some.
- Whether that site has the per-app push rework (frappe/suite#1047). It is on
  `forge/drive-layer`, not on `develop`.
- For a mail that was missed, how far it got (below).

## Inputs

Where a notification can get lost, to check in order. None of these has been
tested or suspected on evidence yet.

- **Stalwart to Suite:** the JMAP push reaching `suite/mail/api/jmap.py`
  (`push_notification`).
- **Pushes frozen:** `freeze_jmap_push_notifications` during a mail or contacts
  import. Check what happens to mail that arrives meanwhile.
- **Turned off on purpose:** `disable_push_notification` on the mailbox.
- **Suite to the relay:** `suite/suite_core/push.py`, through Frappe's
  notification relay, addressed per app. Check that existing subscriptions still
  match after the rework.
- **The device:** the worker (`frontend/src/apps/mail/sw.ts`) and the phone's own
  limits. Notifications on a real iPhone from a deployed site are still untried
  ([Every app as its own phone app](047-every-app-as-its-own-phone-app.md)).
