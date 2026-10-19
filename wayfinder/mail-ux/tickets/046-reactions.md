---
id: 046
title: Reactions
label: wayfinder:grilling
status: open
assignee:
blocked-by: []
---

## Question

A reaction from another mail client (Gmail, Outlook, Apple Mail) arrives as a
near-empty reply, a lone emoji in its own message, and Suite can't send one.
RFC 9078 marks a reaction as a tiny reply whose body part has
`Content-Disposition: reaction`; clients that know it fold it onto the message
it answers, the rest show it as a short reply.

Built once, in [frappe/suite#920](https://github.com/frappe/suite/pull/920),
and stashed on 2026-09-23 when the work paused, not because anything was wrong.
Decide what is left before it ships: where reactions show (chips under the
message, who reacted on hover), which emoji can be sent (a short palette or any),
whether a reaction notifies or counts as unread, how one is taken back, and how
reactions to your own mail from clients that don't send RFC 9078 read.

Moved here from the obvious fixes (C44) on 2026-10-19, at the user's request.

## Inputs

- C44 in [merged problems](../references/merged-problems.md) (I09, G17).
- The stash: "mail reactions (RFC 9078): receive + send, WIP", with
  "MailThread compose WIP" beside it (`git stash list`). Both halves were
  verified against a live bench: incoming reactions parse, fold onto their
  target and render as chips; sending produces real RFC 9078 MIME. The chip row
  itself was never looked at in a browser.
- Stalwart accepts `disposition: "reaction"` on `Email/set` `bodyStructure`,
  and returns `disposition` on `textBody` parts under the default
  `bodyProperties`: no `bodyStructure` fetch on read.
- The message cache is never rebuilt on upgrade: a field newly derived in
  `format_message` needs a backfill patch, or old messages lack it.
- The stash predates the filing rules, the refetch fixes and the search and
  thread changes since; it needs bringing up to date on a fresh branch from
  `forge/drive-layer`.
