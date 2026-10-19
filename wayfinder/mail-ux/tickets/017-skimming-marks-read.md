---
id: 017
title: When mail counts as read
label: wayfinder:grilling
status: closed
assignee:
blocked-by: []
---

## Question

Opening a thread, or passing it with j/k, marks it read at once with no delay
and no setting, so skimming clears unread by accident (search does the same,
see ticket 008). Decide when a mail becomes read: on open, after a dwell
time, on leaving it, or only by explicit action, and whether it differs for
keyboard browsing, the reading pane and phones. Inputs: C09 in [merged problems](../references/merged-problems.md) (A14).

## Answer

2026-10-19, the user: **read on open stays.** Marking a thread read the moment
it opens is fine, j/k included; no delay and no setting.

What did hurt was the Unread filter: opening a thread there marked it read, the
list read itself again, and the thread vanished from under the reader (the
title fell to "[No Subject]", and U had no row to act on). Now a conversation
read in the Unread filter stays on the list, shown as read, until the folder,
filter or tab changes, as Gmail keeps it; an action that takes it off the list
lets it go. [frappe/suite#1035](https://github.com/frappe/suite/pull/1035).

