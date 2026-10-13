---
id: 010
title: A clean inbox
label: wayfinder:grilling
status: closed
assignee: claude (agent, 2026-10-09), with Akash
blocked-by: [001]
---

## Question

The inbox doesn't stay clean: mail that matters sits among newsletters,
notifications, receipts and bursts of automated mail. What does a clean
inbox mean for the user, and what keeps it that way without daily upkeep?
Pin the underlying problem first (too much arrives in the Inbox, it isn't
sorted, it can't be cleared quickly, or all three), then decide the shape
of the answer. Pieces already on the table, as hints rather than answers:
categories (the backend classifies already; survey G07), unsubscribe and a
subscriptions manager (G06), bundling bursts of similar mail (issues I04),
the unknown-sender flow, rules (G10), and sender stacks. Graduate each
piece the answer keeps into its own ticket.

Source: the user's pain list (2026-10-09), marked important.

## Inputs

From [merged problems](../references/merged-problems.md) (ticket 003):
- C01 The Inbox is buried under bulk mail (I04, G05, G06, G07, G08, A30).
- C02 Clearing the Inbox takes too many steps (A07, A13, A20, A90, G21).
- C03 Sorting mail automatically means writing Sieve (G10, A75).
- C34 Mail you can't act on yet gets lost: snooze, follow-up, reply later,
  pin (G01 to G04).

## Answer

Resolved 2026-10-12 with Akash, after a prototype in the running app.

**The problem.** Bulk mail is mixed in with the mail that needs you (B). A
clean inbox means only the mail that needs you is in it. Clearing being slow
(C) comes second; too much arriving (A) and mail you can't act on yet (D)
are supporting pieces, graduated below.

**The shape: category tabs over the Inbox.** Bulk mail leaves the Inbox list
for a view of its own, one per category, reached by tabs. Not bundled inline,
not sectioned, not sidebar entries, and never folded into a menu: the counts
on the tabs are what make moving mail out of Primary safe, so the tabs stay
visible at every width.

- **Where** (the tab row and Primary's count were since reworked by
  [Layout, hierarchy and use of space](012-layout-and-hierarchy.md): the
  tabs now stand in the title bar, and Primary counts too): the Inbox only (each account's and All accounts'). A row of its
  own between the header (folder name) and the toolbar (select all, filter,
  refresh), so scope reads before the controls that act on it. Ruled out:
  tabs in the header in place of or after the name, a header made of tabs in
  every folder, a vertical rail, pills that scroll away, tabs inside the
  toolbar, one bar, and the header folded into the toolbar.
- **Look:** frappe-ui `Tabs`, underline, `md`, as tall as the toolbar; each
  tab an icon and its name; a route per tab (`?category=updates`). A list
  too narrow for every name keeps the selected tab named and shows the rest
  as icon and count, named in a tooltip; a name truncates rather than push a
  tab out. A phone gets a row of ghost pills under the title that scrolls
  sideways.
- **Counts:** unread threads, as frappe-ui's default `Badge`, on every tab
  but Primary. The sidebar's Inbox count and the page title count Primary.
- **Which tabs:** the person picks, per person (User Settings, beside the
  layout preferences), for every account and All accounts. Default: all
  five, Primary, Updates, Forums, Promotions, Social (Social was off until
  2026-10-12; on, so a message moved to Social lands in a tab). No "All
  mail" tab: it would undo the split, and the plain Inbox is every category
  turned off. A category turned off flows back
  into Primary; every category off is the plain Inbox, with no tab row. Set
  in Mail settings, and in place: an icon button at the right end of the tab
  row opens a menu with a switch per category (Primary has none).
- **Primary** is the Inbox's mail in none of the person's turned-on
  categories, so mail not classified yet, and mail of a category turned off,
  is in Primary.
- **Fixing a misfile is per message, with the sender offered:** "Move to
  Category" in a message's menu moves it, and the toast after offers "Always
  for This Sender", which keeps that sender's future mail in that category.
  Moving one message says nothing about the next, so remembering the sender
  is offered rather than assumed. The menu offers all five categories.
  Sender rules name an address or a domain, and come from the account (the
  user's), the site (an admin's) or the app (defaults synced on migrate,
  which a site may switch off); the nearest wins, and they outrank the
  header rules. This is Sagar's design on
  `s-aga-r/feat/mail-classification-rules`, kept on 2026-10-12 over an
  earlier pick here (a per-sender move reaching existing mail too).
- **Clearing a tab:** every tab but Primary has a one-click "Mark all read",
  and "Archive all" in its menu, so a skimmed tab clears in a click and its
  count means "new since I last looked". Both act on the whole category on
  the server, not page by page. No auto-archive.
- **Unknown senders are not a category.** Their mail goes to the category it
  belongs to, marked as today (#965). Whether screening survives stays with
  [Dealing with mail from unknown senders](013-unknown-senders.md).

**For the build.** The classifier exists (`suite/mail/classification/`,
headers only; a JMAP keyword `category_<name>` per message; the site-wide
`enable_email_classification` stays as the admin's off switch). Needed:
a category filter and per-category unread counts on the thread routes (one
batch of collapsed `Email/query` totals); the person's tab choice in User
Settings; the sender rules and per-message move of
`s-aga-r/feat/mail-classification-rules`, ported onto the HTTP contract and
with the move refetching the tab counts; bulk mark-read and archive by
category; and classification of
newly arrived mail before it is first listed, so counts are right.

**Graduated.**

- [Unsubscribing and the subscriptions you get](033-unsubscribe.md) (G06).
- [Muting a thread](034-mute-thread.md) (G05).
- [Sorting mail without writing Sieve](035-rules-without-sieve.md) (C03).
- [Mail you can't act on yet](036-mail-you-cant-act-on-yet.md) (C34).
- [Clearing the Inbox quickly](037-clearing-the-inbox-quickly.md) (C02).
- Notifications by category: an input to
  [Notifications for the mail you care about](024-notifications.md).
- Bundling bursts of similar mail (I04): on the map's Not yet specified;
  tabs absorb most bursts.

**Prototype.** Variants in the running app with a Tweak panel (layouts,
tab labels, sidebar entries), discarded once decided, 2026-10-12.
