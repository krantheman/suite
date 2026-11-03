---
id: 013
title: Dealing with mail from unknown senders
label: wayfinder:grilling
status: open
assignee:
blocked-by: [001, 014]
---

## Question

What is the root problem that screening unknown senders is meant to solve,
and is screening the right answer to it? Question both HEY's Screener and
ours (unscreened mail waits in the Inbox, marked; reply, star or a move
accepts the sender, Junk blocks them; images held back until trusted).
Candidate root problems, to test rather than assume: unwanted mail reaching
the Inbox at all, the cost of telling wanted from unwanted, privacy
(tracking images), first contact from people who matter getting lost, and
decisions that don't stick or don't reach mail already received (issues
I19). Decide what the user's problem is, then what Suite does about it,
including whether "screening" survives as a concept, what it is called, and
how it relates to a clean inbox (ticket 010), junk and blocking.

Source: the user's pain list (2026-10-09). Ours shipped in frappe/suite#965.

## Where it stands (2026-11-03)

The question above is still open: nobody has decided the root problem, though
frappe/suite#965 built one answer to it. This is what that answer does today.

- Unscreened mail waits in the Inbox with an icon on its row, and the Inbox can
  be filtered to it. The question sits under the sender in their newest shown
  message.
- Yes and No answer for every sender the thread waits on. The arrow beside Yes
  singles one out or trusts a domain.
- A block reaches old mail by asking: the Inbox's can move to Junk, other
  folders' stays, and the answer can be remembered (C20, in part). Whether an
  accept reaches old mail has not been checked.

Still true from the audit:
- A35: the banner's No and Yes don't say what they do.
- A36: three vocabularies remain, and Settings still says new senders "go to
  the Screener instead of your Inbox".
- A37: "Screen New Senders" is in both Settings tabs.
- A34: the icon's meaning is only in a tooltip, so touch never learns it.

Not rechecked: A26 (how far trusting a domain reaches) and A31.

## Inputs

From [merged problems](../references/merged-problems.md) (ticket 003):
- C19 What screening is and what its buttons do (A31, A34 to A37).
- C20 A decision about a sender doesn't reach mail you already have (I19,
  A26).
