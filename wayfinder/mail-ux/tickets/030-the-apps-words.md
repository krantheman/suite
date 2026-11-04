---
id: 030
title: The words Mail uses
label: wayfinder:grilling
status: open
assignee:
blocked-by: []
---

## Question

Mail, Mails, Email, message and thread name the same things; casing and
spelling are mixed; some labels read as destructive ("Clear All Mails");
the list and the thread format times differently. Settle Mail's vocabulary
in `suite/mail/CONTEXT.md`, a casing and spelling rule, and the time
formats. Inputs: C47 in [merged problems](../references/merged-problems.md) (A09, A28, A80, A93, A94, A95).

## Decisions so far

- 2026-11-04, the user: **the words are settled in
  [`suite/mail/CONTEXT.md`](../../../suite/mail/CONTEXT.md)** on
  `forge/drive-layer`: "mail" with no plural, "conversation" rather than thread
  in anything a person reads, "message" for one item, and "email" only in "email
  address". Code keeps its protocol's names. Unknown sender and Screener wait on
  [013](013-unknown-senders.md), Outbox on [020](020-what-outbox-is-for.md).
- **Casing:** sentence case, already the repo's rule (`STANDARDS.md`). Mail,
  People and about half of Calendar are behind it.
- 2026-11-04, the user: **spelling is US English.**
- **Time formats (A28):** nothing to decide. The thread no longer shows relative
  time, and the list and thread share one date component.

## Building

Still to do, as one PR after frappe/suite#881 merges, since it touches strings
across Mail and would conflict with that and with other open work: reword Mail's
labels to match, for example "Clear All Mails" to "Clear selection", "Select All
Mails" to "Select all", "Delete Thread" to "Delete conversation", "Download
Email" to "Download message", "Minimise" to "Minimize". Labels are also the
translation keys, so reworded ones lose their translations until they are redone.
This ticket closes when that lands.
