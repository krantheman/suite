---
id: 037
title: Clearing the Inbox quickly
label: wayfinder:prototype
status: open
assignee:
blocked-by: [010]
---

## Question

Getting mail out of the Inbox takes too many steps: Archive and Trash sit in
"…" in the thread and in the desktop bulk bar, hover icons are tiny and put
Trash next to Archive, and phones have no swipe on rows and no visible way
into selection. Decide the primary clearing actions and where they sit on
desktop and phone, including swipe actions. Clearing a whole category tab
is already decided in [A clean inbox](010-a-clean-inbox.md).

Stacks belong here too: the list folds consecutive mail from one sender
into a single row with a count. Opened, a stack lists its threads as bare
rows with only a subject, a preview and a star. They have no sender and no
date, so a stack of thirty near-identical mails reads as thirty identical
rows. Decide:
- when a stack forms, and in which folders;
- what the stack's row says;
- what each thread inside an opened stack shows to tell it apart;
- how a whole stack is cleared in one go.

Source: graduated from [A clean inbox](010-a-clean-inbox.md).

## Inputs

- **A one-click way back to Inbox from Archive** (the user, 2026-10-15). In
  Archive the Archive button is hidden, the mail being there already; that
  place could hold Unarchive, the one common action on archived mail. It is
  Archive reversed, not a Move: it swaps Archive for Inbox on the mail you
  received and leaves every other folder (and your sent mail) as it was, so
  archiving and unarchiving round-trips. Named Unarchive rather than "Move to
  Inbox", since Move To → Inbox stays a plain Move that leaves every folder
  (see [Folders, labels, or both](004-folders-and-labels.md)). Today it takes
  Move To → Inbox.

- The stack row and its opened threads as of 2026-10-15
  (`StackListItem.vue`), from the user.
- C02 in [merged problems](../references/merged-problems.md) (A07, A13,
  A20, A90, G21); overlaps
  [Layout, hierarchy and use of space](012-layout-and-hierarchy.md).
