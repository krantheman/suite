---
id: 046
title: Reactions
label: wayfinder:grilling
status: closed
assignee: claude (agent, 2026-11-04), with Akash
blocked-by: []
---

## Question

A reaction from another mail client (Gmail, Outlook, Apple Mail) arrives as a
near-empty reply, a lone emoji in its own message, and Suite can't send one.
RFC 9078 marks a reaction as a tiny reply whose body part has
`Content-Disposition: reaction`; clients that know it fold it onto the message
it answers, the rest show it as a short reply.

Built once, in [frappe/suite#920](https://github.com/frappe/suite/pull/920),
and stashed on 2026-09-23 when the work paused, not because anything was wrong.
Decide what is left before it ships: where reactions show (chips under the
message, who reacted on hover), which emoji can be sent (a short palette or any),
whether a reaction notifies or counts as unread, how one is taken back, and how
reactions to your own mail from clients that don't send RFC 9078 read.

Moved here from the obvious fixes (C44) on 2026-10-19, at the user's request.

## Inputs

- C44 in [merged problems](../references/merged-problems.md) (I09, G17).
- The stash: "mail reactions (RFC 9078): receive + send, WIP", with
  "MailThread compose WIP" beside it (`git stash list`). Both halves were
  verified against a live bench: incoming reactions parse, fold onto their
  target and render as chips; sending produces real RFC 9078 MIME. The chip row
  itself was never looked at in a browser.
- Stalwart accepts `disposition: "reaction"` on `Email/set` `bodyStructure`,
  and returns `disposition` on `textBody` parts under the default
  `bodyProperties`: no `bodyStructure` fetch on read.
- The message cache is never rebuilt on upgrade: a field newly derived in
  `format_message` needs a backfill patch, or old messages lack it.
- The stash predates the filing rules, the refetch fixes and the search and
  thread changes since; it needs bringing up to date on a fresh branch from
  `forge/drive-layer`.

## Answer

Decided 2026-11-04 with Akash, from testing against real Gmail and Outlook.com
accounts. Built in frappe/suite#1144, which is not merged yet: the chip row is
still to be checked in the browser.

What the clients do:

- Gmail sends its own format, `multipart/alternative` with a
  `text/vnd.google.email-reaction+json` part, and draws a chip only for that
  format. A plain RFC 9078 reaction shows there as an ordinary reply.
- Outlook.com offers no way to react to mail from outside. It shows a reaction
  as a short message, and turns a part marked `Content-Disposition: reaction`
  into an `ATT00001.txt` attachment.
- Outlook for Microsoft 365, Apple Mail and Thunderbird were not tested.

The decisions:

- **Which emoji:** any single emoji, from a short palette that opens onto the
  full picker.
- **Taking one back:** Undo only, during the undo-send period. RFC 9078 has no
  withdrawal and Gmail allows none after its own Undo, and an empty reaction
  would show elsewhere as a blank message. Pressing your own chip says you
  already reacted.
- **The Outbox:** a reaction stays out of it. The Undo wait is held in the browser,
  so it is never a pending send, and its record is removed once sent. Closing the
  page during the wait drops the reaction.
- **Clients that don't send RFC 9078:** Gmail's format becomes a chip. A lone
  emoji reply with no marker stays a message, so nothing is folded by guesswork.
- **Where they show:** chips under the message, with who reacted on hover. Each
  message offers one add button: beside its chips once it has any, otherwise
  beside Forward for the newest message and in the header for an older one.
- **Notifying and unread:** a reaction neither notifies nor counts as unread. It
  doesn't redate a row or bring a conversation back to a folder.
- **What goes out:** Gmail's format only, since one message can't carry both
  markers without the attachment in Outlook. A client that reads only RFC 9078
  sees a short reply.
- **Several reactions:** they add up, as Gmail's do, one per person and emoji.
- **When it's refused:** on mail from a mailing list, past 20 recipients in To and
  Cc, when you aren't in To or Cc, and once you have 20 reactions on a message, as
  [Gmail recommends](https://developers.google.com/workspace/gmail/reactions/format).
  A reaction goes where a reply-all would, so on a list it reaches everyone, and a
  Reply-To address can post it elsewhere. The button stays, dimmed, and says why
  when pressed.

The first build stays in the stash until #1144 merges.
