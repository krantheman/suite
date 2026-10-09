---
id: 003
title: The user's pain list
label: wayfinder:grilling
status: closed
assignee: claude (agent, 2026-10-09), with Akash
blocked-by: [001, 005]
---

## Question

What bothers the user most in Mail today? Collect the list after the audit,
merge it with the audit's findings, the survey's gaps and the GitHub
issues, grouped by underlying problem, into one ranked list
by this map's order of work, and graduate each item into its own ticket.

## Comments

- 2026-10-09: Items from the user so far, each now its own ticket: forwards
  leave the thread (006), Sent shows unread (007), search opens the first
  result (008), search inside attachments (009). Marked important: a clean
  inbox (010) and finding a specific mail (011). Also: layout and use of
  space (012), unknown senders (013).
- 2026-10-09: On the audit's All accounts findings, the user confirmed the
  view needs checkboxes and selection like a single account's list (A02).

## Answer

Resolved 2026-10-09 with the user. Every finding from the four sources
(audit A01 to A95, GitHub I01 to I29, survey G01 to G29, the user's pains)
was merged by underlying problem into 50 clusters:
[references/merged-problems.md](../references/merged-problems.md).

- Problems with an obvious fix skip the map: 17 clusters went to
  [fixes.md](../fixes.md), grouped so each group ships as one PR.
- Findings that sit inside a broad ticket are attached to it as inputs
  rather than ticketed now (A clean inbox, Finding a specific mail, Layout,
  plus the existing tickets they fit); the broad ticket graduates pieces as
  it decides.
- 17 new decision tickets, 016 to 032.
- Already fixed: I16, I25 to I29; I20 is probably not reproducible and sits
  in fixes.md to verify. Out of scope: G16, G27, G28.
- The order of work is recorded in the map's Notes and overrides lowest
  number first. Every decision is shown as several options first.
