---
id: 018
title: Which account a mail belongs to and goes out from
label: wayfinder:prototype
status: open
assignee:
blocked-by: []
---

## Question

With several accounts you can't tell which one a mail belongs to or will
go out from: All accounts marks only non-default rows, an open thread
doesn't name the receiving account, From is a grey chip with several
accounts yet always shown with one, settings name no account, and the
switcher shows no counts. Decide how account identity shows across the
list, the thread, compose, settings and the switcher, scaled to how many
accounts and identities a user has. Inputs: C21 in [merged problems](../references/merged-problems.md) (A01, A29, A43,
A57, A69, I15).

## Inputs

- A56 from the audit: All accounts has no Outbox and no New Folder. A new
  folder has to go in some account, and an Outbox across accounts needs a
  shape; decide both here. Moved from fixes.md (2026-10-09).
- Still single-account in All accounts after frappe/suite#977: Move To and
  Add To on a selection, since folders differ per account.
