---
id: 040
title: Mail on a phone
label: wayfinder:grilling
status: open
assignee:
blocked-by: []
---

## Question

Mail is to be an app of its own on a phone, as every product is (the user,
2026-10-19): this designs it as that, with no Suite bottom bar, once
[Every app as its own phone app](047-every-app-as-its-own-phone-app.md)
settles how the apps are split.

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

## Where it stands (2026-11-03)

[Every app as its own phone app](047-every-app-as-its-own-phone-app.md) closed,
so this is unblocked. Already decided and built, not to reopen without reason
(frappe/suite#1039, #1050): the bottom bar, the title row, the categories line,
Profile and accounts, the folders sheet, and the thread's toolbar and subject.

What this ticket still has to decide:
- what replaces a hover: row actions, the sender card, folded messages;
- whether selection, compose, search and settings hold up at phone width;
- where toasts and bars sit so nothing covers the content;
- whether all of it reads as one app.

Start by checking the running app at phone width: C16, C17, C13 and C31 below
come from the audit, before this work, and have not been rechecked. C17 and C31
also have entries in [fixes.md](../fixes.md).

**Clean up the categories and the top bar** (the user, 2026-11-04). Above the
first mail in the Inbox a phone stacks three rows, about a fifth of the screen:
the title, the categories line and the "All mail" filter row. The categories
line runs off the edge with counts of "99+", and the filter row holds only the
filter and a ⋯. Nothing is chosen yet. Three options to try in the running app:

- **Two rows:** the filter and ⋯ become icons in the title row; the categories
  line stays, still cut off.
- **One row:** categories move into the sheet "Inbox ⌄" already opens; their
  counts go out of sight.
- **One row, categories as list rows:** one line each among the mail, by date.
  This changes [A clean inbox](010-a-clean-inbox.md) for the phone. A prototype
  is in a local stash, "proto: Inbox categories as list rows, with sender
  logos"; a category whose newest mail hasn't loaded yet doesn't show in it.

Source: the user, 2026-10-15. Inputs from
[merged problems](../references/merged-problems.md):
- C16 Phone touch targets are 16–28px (A08, A39, A87).
- C17 Fixed elements cover content on phones (A62, A88, I23).
- C04 Phone and desktop lists differ, and the phone's nav takes too much
  room.
- C13 Wide HTML needs panning on a phone.
- C31 On phones, Attach only appears once you type.
