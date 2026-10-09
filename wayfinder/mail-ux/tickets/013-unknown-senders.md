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

## Inputs

From [merged problems](../references/merged-problems.md) (ticket 003):
- C19 What screening is and what its buttons do (A31, A34 to A37).
- C20 A decision about a sender doesn't reach mail you already have (I19,
  A26).
