---
id: 033
title: Unsubscribing and the subscriptions you get
label: wayfinder:grilling
status: open
assignee:
blocked-by: [010]
---

## Question

A person can't stop mail they never want to see again without hunting for a
link in the footer, and has no view of what they're subscribed to. Decide
how unsubscribing works (where the action shows, which mail offers it, what
happens to mail already received from that list) and whether Suite keeps a
subscriptions view (senders by volume, one-click unsubscribe), and where it
lives now that bulk mail has category tabs.

Source: graduated from [A clean inbox](010-a-clean-inbox.md).

## Inputs

- G06 in [the feature gap survey](../references/feature-gap-survey.md):
  JMAP exposes `header:List-Unsubscribe` and `List-Unsubscribe-Post`; the
  one-click POST (RFC 8058) should go from Suite's server, not the browser;
  the `mailto:` variant is an ordinary submission; RFC 9979's
  `$canunsubscribe` and `$unsubscribed` keywords can remember state.
- Suite already reads `List-Unsubscribe` to classify mail as Promotions.
