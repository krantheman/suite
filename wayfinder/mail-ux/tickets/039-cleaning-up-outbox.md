---
id: 039
title: Cleaning up Outbox
label: wayfinder:grilling
status: open
assignee:
blocked-by: [020]
---

## Question

Once [What Outbox is for](020-what-outbox-is-for.md) settles its purpose and
words, bring the page itself in line, in plain language throughout. Today it
reads like a delivery log: status tabs named Pending, Final and Cancelled;
empty states about "submissions" and "concluded deliveries"; filters for
Email ID, Thread ID and Identity; a detail view headed Envelope, Identifiers,
Activity and Reports with SMTP-level entries; and actions named Cancel
Delivery, Send Again and Reschedule delivery. Decide what stays on the page,
what moves behind a details view or out of it entirely (the ID filters
especially), how a scheduled, sending, sent and failed mail each read in the
list, and the words for every tab, empty state, action and confirmation. It
should match the rest of Mail as rebuilt in
[Layout of the thread, compose and sidebar](038-thread-compose-and-sidebar-layout.md):
frappe-ui, the list's monochrome states, and the sidebar's Outbox, which
leads with a count only while something waits to send.

Source: the user, 2026-10-15. Inputs: C23 in
[merged problems](../references/merged-problems.md) (A64 to A68), the page as
of that date (`OutboxView.vue`, `SubmissionDetailsView.vue`,
`OutboxFilters.vue`, `SubmissionActivity.vue`).
