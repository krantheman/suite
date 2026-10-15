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

In short: mail you received goes wherever you file it; your own mail has a
home it isn't filed out of (sent mail in Sent, a draft in Drafts), and only
deleting takes it out. A conversation shows in full wherever any of its
messages is, whichever folders they are stored in.

| Action | Mail you received | Your sent mail | Your draft |
|---|---|---|---|
| Archive | Inbox → Archive (Archive added if not in Inbox) | Stays in Sent | Stays in Drafts |
| Move to X | Leaves everywhere, goes to X | Goes to X, keeps Sent | Stays in Drafts |
| Folders ticks | Adds or removes one folder | Adds or removes one folder; Sent stays | Not offered |
| Junk | Leaves every folder for Junk, marked junk | Stays in Sent | Stays in Drafts |
| Not junk | Junk → Inbox, junk mark cleared | Untouched | Untouched |
| Trash | Goes to Trash | Goes to Trash | Discarded |
| Out of Trash to X | Goes to X | Goes to X and back to Sent | — |

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
- 2026-10-15, the user: **Sent always keeps what you sent; only Trash takes it
  out.** Sent mail can be filed — Move puts it in the target, the Folders tick
  menu adds or removes folders of yours on it — but never leaves Sent, whose
  tick can't be cleared. So a conversation of only your own outreach can still
  be moved to a folder, and Sent stays the full record of what you sent.
  Letting Move take mail out of Sent was weighed and turned down: Move carries
  whole conversations, so filing one from Inbox would have taken your replies
  out of Sent without your noticing.
- 2026-10-15, the user: **Move puts a conversation in the target, and only
  there, from any view.** The mail you received leaves Inbox, Archive and
  every folder of yours for the target. Your sent mail goes into the target
  too but never leaves Sent (see below), and a draft stays only in Drafts. The
  whole conversation moves, so a newer reply waiting in Inbox goes
  with it (still unread). A mail deliberately filed in two folders loses the
  other; the Folders tick menu is how to add or take away one folder and leave
  the rest. So each tool means one thing: Archive, out of Inbox into Archive;
  Move, it lives here now; the tick menu, one folder more or less. Today a
  move already replaces every folder (`move_messages_to_mailbox`,
  `replace_mailboxes=True`) and re-adds Sent to your sent mail, so the change
  is drafts: today a draft is moved out of Drafts. (This replaced, the same day, rules under which
  Move left only the folder you were in, and from Starred or Search left only
  Inbox and otherwise just added the target.)
- 2026-10-15, the user: **Trash takes the whole conversation, your own mail
  included, from any view.** It isn't filing but getting rid of something, so
  unlike Archive and Move it takes your sent replies out of Sent too: trashing
  from Sent trashes your sent mail, and trashing from Inbox takes your replies
  with the rest. As today (`movesAll` sends every message to Trash). A reply
  draft in a trashed conversation is discarded with it, not put in Trash; in
  Drafts it is Discard, deleted for good behind an Undo. Undo right away puts
  every message back exactly where it was. Moved out of Trash later to a
  folder, received mail goes there and your sent mail goes there and back into
  Sent, as any Move. Left in Trash, it goes for good after 30 days or on
  Delete forever.
- 2026-10-15, the user: **Junk takes only the mail you received.** It leaves
  every folder for Junk and is marked junk (training the filter, and the
  block-sender prompt where the account asks for it, as today); your sent mail
  stays in Sent and a reply draft in Drafts. Not junk puts the received mail
  back in Inbox and clears the mark; your own mail, never moved, needs nothing.
  Undo right away restores every message exactly. In Sent, Junk is offered
  only when the conversation holds received mail; Drafts never offers it.
  Today both directions take every message (`set_spam_status`,
  `replace_mailboxes=True`): Junk files your sent replies in Junk, and Not
  junk puts them in Inbox rather than Sent.
- 2026-10-15, the user: **in Search, actions act on the whole conversation**,
  as everywhere else. Today a result is one message and actions take only the
  results from its conversation (`threadMails` picks result rows by thread),
  so a message of the thread that didn't match, or isn't loaded, is left
  behind. Acting on one message stays possible from the open thread's
  per-message menu. How results are shown is for
  [Finding a specific mail](011-finding-a-specific-mail.md).
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
