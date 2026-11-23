---
id: 051
title: Search shows why a row matched
label: wayfinder:design
status: open
assignee:
blocked-by: []
---

## Question

A result row shows the start of the body, not the words it was found by, so a good match looks like a false one ("onboarding" on ih: 3 of the first 4 looked wrong).

Proposed: Ask Stalwart for match snippets and show the passage that matched, with the words marked. A match in an attachment's text reads "In hiring-plan.txt: …". One row for the palette, the results page and the phone.

Source: a study of search on 2026-11-23, with a prototype at https://sketch.netchamp.dev/u/krantheman/mail-search-gaps (the Tweak panel flips each fix back to today's). Priority is the user's to set.

frappe/suite#1174 built much of this: approved, then closed unmerged on Nov 5. Its branch `claude/mail-search-rebuild-c58cb2` is still on the fork.
