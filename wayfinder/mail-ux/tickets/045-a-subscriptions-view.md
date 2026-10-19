---
id: 045
title: A view of your subscriptions
label: wayfinder:grilling
status: open
assignee:
blocked-by: [033]
---

## Question

Should Suite keep a view of what a person is subscribed to: the senders of
their bulk mail, by volume, each with its own Unsubscribe? It is the quickest
way to clear years of newsletters (Gmail and Outlook have one). Decide
whether it is wanted, where it lives (a page of its own, inside the
Promotions and Updates tabs, or in Settings), what counts as a subscription
(mail with a `List-Unsubscribe` header, as
[Unsubscribing](033-unsubscribe.md) offers it), and how it is counted.

Parked by the user on 2026-10-19: Unsubscribe beside the sender ships first,
and this is taken up when people ask for it.

## Inputs

- JMAP can't group or count mail by sender, so the view needs a count of its
  own kept as mail arrives (classification already reads the headers then,
  see `suite/mail/classification/headers.py`), or a scan of the mailbox.
- RFC 9979's `$unsubscribed` keyword can say which senders are already done.
- [Unsubscribing](033-unsubscribe.md) settles the action itself: header only,
  one-click from the server, held for Undo.
