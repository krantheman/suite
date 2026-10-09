---
id: 001
title: Heuristic audit of the running app
label: wayfinder:research
status: closed
assignee: claude (agent, 2026-10-09)
blocked-by: []
---

## Question

What UX problems does the running Mail app have today? Walk every in-scope
surface at su1.localhost:8081, on desktop and at phone width, and judge it
against Nielsen's ten usability heuristics plus mail-specific checks (state
after an action, Undo, wrong-account risk, empty and error states, keyboard
reach, touch targets). Each finding names the surface, what happens, which
heuristic it breaks, and how often a user would hit it. Findings go in
`references/heuristic-audit.md`; no fixes proposed beyond a one-line hint.

## Answer

Resolved 2026-10-09 by an agent in the user's browser, observe-only.
Findings: [references/heuristic-audit.md](../references/heuristic-audit.md),
95 findings (A01 to A95) across 12 surfaces. Phone checks used a 390 px
frame, so touch-only behaviour was confirmed in code. Not exercised: the
schedule-send picker and the arrow menu beside Yes.

Most pressing: All Inboxes never says which account a row or open thread
belongs to (A01, A29), and has no selection (A02); the only quick reply is
Reply All (A22); Archive and Trash hide in menus on desktop (A20, A13);
recipient suggestions make the wrong address easy to pick (A42); wide HTML
mail is clipped (A27); No on the unknown-sender bar doesn't say it junks
(A35); settings don't say which account they change (A69); emptying Trash
or Junk doesn't say how much or that it's permanent (A18); compose loses
focus to the list (A40); opening a thread marks it read at once (A14);
phone touch targets are small (A87); reply buttons only at the thread's end
(A21).
