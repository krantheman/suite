---
id: 044
title: Mail refetches everything on every focus
label: wayfinder:grilling
status: open
assignee:
blocked-by: []
---

## Question

Mail became painfully slow with the Drive PR
([frappe/suite#881](https://github.com/frappe/suite/pull/881)): every click
fires network calls, and moving the cursor through the list lags. The
backend isn't it: `get_threads` answers in about 0.1s.

The likely cause: `8292f00f1` (2026-10-06) moved Mail's reads onto the shared
server-state layer, which invalidates every observed query on window `focus`
and on `visibilitychange` (`frontend/src/platform/server-state/index.ts`,
lines 142-147). The thread list is an infinite query, so each refresh refetches
every loaded page in turn and replaces all the rows, and the list redraws.
Mail bodies render in iframes: clicking back out of one gives the window
focus, so nearly every click into the page sets it off, as does switching
back from another app.

Proposed: drop the `focus` refresh, keep `visibilitychange` but throttle it
(skip if the last refresh was under ~30s ago). Mail has realtime
invalidation already. The layer is Faris's and shared by Drive, Writer and
the rest, so the fix is a small PR into `forge/drive-layer`. Left for later
by the user on 2026-10-16.

Not yet confirmed with a browser trace: record the network calls and a
performance profile while clicking and moving through the list, before and
after the fix, and check the cursor lag is the row swaps and not something
else from the new shell.

Inputs: `frontend/src/platform/server-state/index.ts`, `reads.ts`
(`invalidate`, `refreshPages`), `useInfiniteQuery(api.mail.threads.list)` in
`MailboxView.vue`.
