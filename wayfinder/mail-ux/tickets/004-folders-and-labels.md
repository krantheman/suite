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
  as well.
- 2026-10-15, the user: **Archive swaps Inbox for Archive, in every view.** A
  mail in Inbox leaves Inbox for Archive; a mail not in Inbox just gets
  Archive added. No other folder is ever touched — not the folder you're in,
  not Sent — in Inbox, a category tab, a folder of your own, Sent, Starred,
  Search or All Inboxes alike. Where nothing left Inbox the row doesn't move,
  so the toast says "Added to Archive" rather than "Archived". Today Archive
  from Inbox moves every message, your sent replies included, and replaces
  their other folders, while Archive from Sent only adds Archive and leaves
  the conversation in Inbox. (This replaced, the same day, a rule under which
  Archive also took mail out of a folder of your own you archived it from;
  taking mail out of a folder is Move's job.)
- 2026-10-15, the user: **your own mail is never archived.** Archive touches
  only the mail you received; your sent mail stays only in Sent, as a draft
  stays only in Drafts, and the archived conversation still reads in full
  because a thread is drawn from every folder. In Sent, Archive is offered only
  when the conversation holds received mail; a conversation of nothing but
  your own sent mail has nothing to archive.
- 2026-10-15, the user: **Move, from a folder, takes a mail out of the folder
  you're in, not every folder.** From Inbox (All Inboxes being each account's
  Inbox), a category tab, Archive or a folder of your own, the conversation's messages in that folder leave it for
  the target, and every other folder they're in is kept. Today a move replaces
  every folder (`move_messages_to_mailbox`, `replace_mailboxes=True`), which
  loses the other filings; that changes.
- 2026-10-15, the user: **Move, from a view that isn't a folder, puts the mail
  in the target and only there.** From Starred, Search or Sent,
  where you can't see where a mail is filed, it leaves Inbox, Archive and every
  folder of yours for the target. Sent and Drafts are never left: your own
  mail stays there. A mail deliberately filed in two folders loses the other;
  the Folders tick menu is how to add one. (This replaced, the same day, a
  rule under which Move there left only Inbox and otherwise just added the
  target, which made a move from Starred act as a copy.)
- 2026-10-15, the user: **drag is a plain Move.** Dropping a conversation on a
  folder follows the Move rule; no modifier files it as well. The Folders tick
  menu is the only way to file it in several.
- 2026-10-15, the user: **a draft is stored only in Drafts, and is seen
  wherever its conversation is.** Archive and Move never take a draft out of
  Drafts. Drafts offers only Discard (and Send from the editor); Archive, Junk,
  Move, Folders, Star and Mark as unread go there — today Archive shows on a
  draft's row, in its toolbar and on E, and files the draft out of Drafts. A
  reply draft still shows in its conversation and on the conversation's row in
  Inbox, Archive or any folder, as it does today, since a conversation is
  drawn from every folder its messages are in.
- 2026-10-15, the user: **a draft can't be starred anywhere**, Search results
  included. A star on a draft didn't last: every save replaces the draft with
  one built with only `$draft` and `$seen` (`build_email_draft`), so the star
  went at the next autosave and never reached the sent mail. The thread's own
  star already skips drafts (`lastMessageOf`); a conversation's star elsewhere
  stars the mail received.

## Still open

- **Where categories fit.** Proposed: categories stay parts of the Inbox,
  never folders. They are left out of the Folders tick menu, and moving a mail
  between them re-sorts it (the per-message category move and its sender
  rule) rather than filing it. Archive from a category tab already follows the
  one rule above. Held on 2026-10-15 at the user's request until Sagar's work
  is done; come back to it then. The sidebar needs nothing new here: its
  layout was settled in
  [Layout of the thread, compose and sidebar](038-thread-compose-and-sidebar-layout.md).
