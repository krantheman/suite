---
id: 012
title: Layout, hierarchy and use of space
label: wayfinder:grilling
status: open
assignee:
blocked-by: [001]
---

## Question

Mail's screen doesn't use its space well, and what matters doesn't stand
out. Pin the underlying problem per region: the shell's rail and panel, the
folder sidebar, the list (row density, what a row shows, toolbar), the
reading pane (header, actions, banners, width of the message), and compose,
on desktop sizes from a laptop to a wide monitor and on a phone. Decide the
hierarchy: what is always visible, what is one click away, what is hidden,
and how the regions share space (split view, full width, resizable panes).
It has to sit inside the unified shell's rail, panel and content pane
([unified-frontend](../../unified-frontend/MAP.md), ticket 010). Expect a
prototype ticket to follow once the problems are pinned.

Source: the user's pain list (2026-10-09).

## Inputs

From [merged problems](../references/merged-problems.md) (ticket 003):
- C04 The screen doesn't use its space well (A04, A05, A06, A86, A89, I24).
- C08 A row doesn't describe its thread: which message represents a thread
  in each view (I02).
- C10 Thread menus overlap and mix routine, risky and technical items (A24,
  A25, A33).
- C29 Compose covers the mail you're answering (A38, I14).
- C40 No context on who you're writing to: a sender pane (G13).
