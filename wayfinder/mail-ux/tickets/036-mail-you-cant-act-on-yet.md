---
id: 036
title: Mail you can't act on yet
label: wayfinder:grilling
status: open
assignee:
blocked-by: [010]
---

## Question

Mail that needs a reply on Friday, or a follow-up if nobody answers, sits
in the Inbox or gets lost. Decide which of snooze, "remind me if no reply",
a reply-later queue and pinning Suite offers, how few concepts can cover
them alongside star, and where snoozed mail waits and comes back.

Source: graduated from [A clean inbox](010-a-clean-inbox.md).

## Inputs

- C34 in [merged problems](../references/merged-problems.md) (G01 to G04).
- [The feature gap survey](../references/feature-gap-survey.md): Stalwart
  has no snooze; a mailbox with RFC 9979's `Snoozed` attribute plus a Frappe
  scheduled job can carry it, and the same scheduler serves follow-up
  reminders (a check for a newer message from someone else in the thread).
