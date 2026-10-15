---
id: 040
title: Mail on a phone
label: wayfinder:grilling
status: open
assignee:
blocked-by: []
---

## Question

Mail has been rebuilt on desktop: the list in
[Layout, hierarchy and use of space](012-layout-and-hierarchy.md), and the
thread, compose and sidebar in
[Layout of the thread, compose and sidebar](038-thread-compose-and-sidebar-layout.md).
Go through the whole app on a phone and decide how each part should work
there. Cover the list and its selection, the thread and its actions, compose
(a page of its own, never a sheet over the list), the folder menu, search and
settings.

For each screen, decide:
- what is always visible, what is one tap away, and what is left out;
- what replaces a hover (row actions, the sender card, the folded messages);
- where toasts and bars sit so nothing covers the content.

Where a desktop decision doesn't carry over to a phone, say so and pick the
phone's own answer. Don't copy the desktop layout as it is.

Other tickets already ask phone questions of their own: swipe on rows (037),
the phone's unread count (015), skimming (017), search (008) and the
settings home (032). This one gathers the rest and checks that the phone
reads as one app.

Source: the user, 2026-10-15. Inputs from
[merged problems](../references/merged-problems.md):
- C16 Phone touch targets are 16–28px (A08, A39, A87).
- C17 Fixed elements cover content on phones (A62, A88, I23).
- C04 Phone and desktop lists differ, and the phone's nav takes too much
  room.
- C13 Wide HTML needs panning on a phone.
- C31 On phones, Attach only appears once you type.
