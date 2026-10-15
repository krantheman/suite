---
id: 004
title: Folders, labels, or both
label: wayfinder:grilling
status: open
assignee:
blocked-by: []
---

## Question

A thread can sit in several folders at once, which is how labels behave, but
the UI only says "folders". Decide the model the user sees: folders, labels,
or both. Settle what Move, Archive and drag-and-drop mean under it, how the
sidebar presents it, and where categories would fit.

## Inputs

From [merged problems](../references/merged-problems.md) (ticket 003):
- C11 Folders behave like labels (A23, A55, A58, I05, I06, G09).

## Decisions so far

- 2026-10-15, the user: **folders, everywhere.** People are told these are
  folders, in every screen and message; "mailbox" stays only where it means a
  whole account (an admin giving someone a mailbox). Labels are not offered.
  The words Mail already used for a folder ("Items in this mailbox…", "empty
  this mailbox", the move/add/remove failures, the folder-not-found errors)
  were changed to say folder on fix/thread-view.
- 2026-10-15, the user: **a mail can still sit in more than one folder.** The
  Folders tick menu stays as the one deliberate way to file it somewhere else
  as well. Move, drag and Archive stay moves.
- 2026-10-15, the user: **Move and Archive take a mail out of the folder
  you're in, not every folder.** Archive from Inbox leaves Inbox for Archive
  and keeps any other folder it was filed in. Today a move replaces every
  folder (`move_messages_to_mailbox`, `replace_mailboxes=True`), which loses
  the other filings; that changes.
- 2026-10-15, the user: **one rule for Archive in every view: it takes the
  conversation out of Inbox.** In a folder of your own it also takes it out of
  that folder. Sent, Starred, Search, All Inboxes and the category tabs all
  follow it; nothing ever leaves Sent. Today Archive from Inbox moves every
  message, your sent replies included, and replaces their other folders, while
  Archive from Sent only adds Archive and leaves the conversation in Inbox.
  Move follows the same shape: out of the folder you're in where that is a
  folder of yours or Inbox, otherwise out of Inbox if it's there, otherwise
  only added to the target.
- 2026-10-15, the user: **a draft is stored only in Drafts, and is seen
  wherever its conversation is.** Archive and Move never take a draft out of
  Drafts. Drafts offers only Discard (and Send from the editor); Archive, Junk,
  Move, Folders, Star and Mark as unread go there — today Archive shows on a
  draft's row, in its toolbar and on E, and files the draft out of Drafts. A
  conversation's star elsewhere still works; it stars the mail received.
- 2026-10-15, the user: **a draft can't be starred anywhere**, Search results
  included. A star on a draft didn't last: every save replaces the draft with
  one built with only `$draft` and `$seen` (`build_email_draft`), so the star
  went at the next autosave and never reached the sent mail. The thread's own
  star already skips drafts (`lastMessageOf`). A reply draft still shows in its
  conversation and on the conversation's row in Inbox, Archive or any folder,
  as it does today, since a conversation is drawn from every folder its
  messages are in.
- 2026-10-15, the user: **drag is a plain Move.** Dropping a conversation on a
  folder follows the Move rule; no modifier files it as well. The Folders tick
  menu is the only way to file it in several.

## Still open

- **Where categories fit.** Proposed: categories stay parts of the Inbox,
  never folders. They are left out of the Folders tick menu, and moving a mail
  between them re-sorts it (the per-message category move and its sender
  rule) rather than filing it. Archive from a category tab already follows the
  one rule above. Held on 2026-10-15 at the user's request until Sagar's work
  is done; come back to it then. The sidebar needs nothing new here: its
  layout was settled in
  [Layout of the thread, compose and sidebar](038-thread-compose-and-sidebar-layout.md).
