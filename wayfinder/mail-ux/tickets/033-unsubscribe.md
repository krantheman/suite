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

## Decisions so far

- 2026-10-19, the user: **Unsubscribe shows beside the sender** of an open
  message that offers it (its `List-Unsubscribe` header), as a quiet link after
  the address, on a phone as on a desktop (it sits by the name there, where
  the address is not shown). Not in the message's "…" menu either (the
  user, 2026-10-19): one place to find it. Not a banner (three strips over every newsletter) and not beside
  the subject (a conversation has several senders, and a phone hides the
  subject). Tried in a prototype with a Tweak panel (branch
  `proto/unsubscribe`).
  - **Never while the Screener asks about the sender.** "No" there blocks the
    sender inside Suite only, and never unsubscribes: unsubscribing tells a
    stranger, often a spammer, that the address is read, and can't be taken
    back the way a block can. One question at a time.
  - **Never in Junk**, for the same reason.
  - **It reads "· Unsubscribe"**: a middle dot after the address, then the word
    underlined in grey, so it is plainly a link without a button's weight
    (the user, 2026-10-19, of five styles tried). Once used, it reads
    "Unsubscribed", in lighter grey and no longer a link.
  - The words claim no more than the header says: "Unsubscribe", not "a
    mailing list you are on" (a one-off invite to a group address carries the
    header too).

- 2026-10-19, the user: **mail already received stays where it is.**
  Unsubscribing only stops what comes next; nothing is archived or moved,
  and no offer to is made.

- 2026-10-19, the user: **Unsubscribe can be undone for a few seconds, as
  sending can.** Once a request reaches the sender there is no taking it back
  (no standard resubscribe), so it is held: the toast says "Unsubscribed"
  with Undo for about 10 seconds, and only then does the server send the RFC
  8058 POST, or the mailto request as a short scheduled send. Undo cancels it
  before anything leaves, so the sender never knew. A sender offering only a
  web page needs no Undo: Suite opens the page and the person unsubscribes
  there.

- 2026-10-19, the user: **only mail with a `List-Unsubscribe` header offers
  it.** No reading the body for a footer link: that is guesswork, can open a
  wrong or hostile link, and can never be one click. Gmail and Yahoo have
  required the header of bulk senders since 2024, so the mail that matters
  carries it; a footer link stays where the sender put it.

Still to decide: the RFC 8058 POST and mailto paths, and whether a
subscriptions view is wanted.

