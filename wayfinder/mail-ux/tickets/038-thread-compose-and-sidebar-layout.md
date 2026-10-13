---
id: 038
title: Layout of the thread, compose and sidebar
label: wayfinder:grilling
status: open
assignee:
blocked-by: [012]
---

## Question

The rest of [Layout, hierarchy and use of space](012-layout-and-hierarchy.md),
which decided the list. Pin the underlying problem per region and decide the
hierarchy for the reading pane (header, actions, banners, width of the
message), compose, the folder sidebar, and the shell's rail and panel, on
desktop sizes from a laptop to a wide monitor and on a phone: what is always
visible, what is one click away, what is hidden, and how the regions share
space (split view, full width, resizable panes). Keep to what the list
settled: a 48px bar over each pane, frappe-ui throughout, the View menu
beside Compose. It sits inside the unified shell's rail, panel and content
pane ([unified-frontend](../../unified-frontend/MAP.md), ticket 010).

Source: the user's pain list (2026-10-09), split from ticket 012 on
2026-10-13.

## Inputs

From [merged problems](../references/merged-problems.md) (ticket 003):
- C04 The screen doesn't use its space well (A04, A05, A06, A86, A89, I24),
  beyond the list.
- C08 A row doesn't describe its thread: which message represents a thread
  in each view (I02).
- C10 Thread menus overlap and mix routine, risky and technical items (A24,
  A25, A33).
- C29 Compose covers the mail you're answering (A38, I14).
- C40 No context on who you're writing to: a sender pane (G13).
