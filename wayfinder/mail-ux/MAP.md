---
label: wayfinder:map
tracker: local-markdown
---

# Map: Mail UX

## Destination

Every UX problem in Suite Mail, and every new feature worth adding, decided
and specified well enough to build as its own PR. Building happens outside
this map, one PR per decision, and can start as soon as a ticket closes.

Scope, decided 2026-10-09: everything an end user touches in Mail, on desktop
and mobile web: the mailbox lists and All accounts, the thread view, compose,
search, the sidebar and folders, notifications, the unknown-sender flow,
contacts as Mail uses them (picker and recipient suggestions), Outbox, and
Mail settings.

## Notes

- Problems come from four sources, merged into one ranked list: the user's
  pain list (weighted highest), a heuristic audit of the running app, a
  feature gap survey against Gmail, Superhuman, HEY, Fastmail, Apple Mail and
  Spark, and the Mail issues on GitHub.
- Fix the underlying problem, not the reported symptom. A fix an issue or a
  competitor suggests is a hint; each ticket names the problem first and
  decides the fix from there, and one fix may close several reports.
- New features may need backend work, as long as Stalwart or JMAP can carry
  them. Anything that needs a service outside the mail server is flagged and
  decided on its own, not ruled out.
- Designed for people at a company using Suite as their work mail, heavy
  keyboard users included. The default UI is built for mouse and touch and
  should work well without setup; keyboard users get shortcuts on top, never
  at the cost of clarity.
- Order of work: daily friction (the list, the thread), then trust and safety
  (lost mail, wrong account, Undo, sending state), then compose and search,
  then new features, then settings and polish. Within each group, the user's
  biggest pains first. The user marked two pains as most important: a clean
  inbox and finding a specific mail; their tickets lead the work.
- Every decision is shown as several distinct options before one is
  chosen. Questions of look and feel get variants in the running app with a
  switcher panel; questions of behaviour or model get options laid out with
  their trade-offs, and a small demo where the behaviour is hard to picture.
- Problems with an obvious fix skip the tickets and live in
  [fixes.md](fixes.md), grouped so each group ships as one PR.
- **Order of work**, agreed 2026-10-09, overriding lowest-number-first:
  [A clean inbox](tickets/010-a-clean-inbox.md),
  [Finding a specific mail](tickets/011-finding-a-specific-mail.md),
  [Layout, hierarchy and use of space](tickets/012-layout-and-hierarchy.md),
  [Your own mail and unread](tickets/015-your-own-mail-and-unread.md),
  [Forwards leave the conversation](tickets/006-forwards-leave-the-thread.md),
  [Who a reply goes to](tickets/016-reply-defaults.md),
  [When mail counts as read](tickets/017-skimming-marks-read.md),
  [Folders, labels, or both](tickets/004-folders-and-labels.md),
  [Dealing with mail from unknown senders](tickets/013-unknown-senders.md),
  [Which account a mail belongs to and goes out from](tickets/018-which-account.md),
  [Trusting that a draft is saved](tickets/019-draft-safety.md),
  [What Outbox is for](tickets/020-what-outbox-is-for.md),
  [Search opens the first result](tickets/008-search-opens-the-first-result.md),
  [Which signature is added](tickets/021-which-signature.md),
  [Templates and snippets](tickets/022-templates.md),
  [Shared inboxes and delegation](tickets/023-shared-inboxes.md),
  [Notifications for the mail you care about](tickets/024-notifications.md),
  [Discussing a mail with colleagues](tickets/025-team-comments.md),
  [AI and translation](tickets/026-ai-and-translation.md),
  [Mail without a connection](tickets/027-offline.md),
  [Asking for a read receipt](tickets/028-read-receipts.md),
  [Private notes on a thread](tickets/029-private-notes.md),
  [The words Mail uses](tickets/030-the-apps-words.md),
  [The shortcut set](tickets/031-shortcuts.md),
  [How Mail settings are organised](tickets/032-settings-organisation.md).
  Take the first open, unblocked, unclaimed ticket in this list.
- Settled terms go in `suite/mail/CONTEXT.md` (glossary only), listed in
  `CONTEXT-MAP.md`. Sessions consult the `grilling` and `domain-modeling`
  skills; UI questions use `prototype` (variants in the running app with a
  switcher panel).
- Mail mounts in the unified shell as it is
  ([unified-frontend](../unified-frontend/MAP.md), ticket 010). Designs here
  sit inside that shell's rail, panel and content pane, and use frappe-ui.
- Inventory of the Mail UI as of 2026-10-09:
  [references/inventory.md](references/inventory.md).

## Decisions so far

- [The user's pain list](tickets/003-pain-list.md): all four sources merged into
  50 problems; 33 decisions became tickets or inputs, 17 obvious fixes went
  to fixes.md, and the order of work is set.

- [How others handle unknown senders](tickets/014-unknown-sender-handling-elsewhere.md):
  only HEY and Spark gate first contact; classifiers lose it too; HEY's
  screener costs effort and loses resets and receipts.

- [Sent mail shows as unread](tickets/007-sent-mail-shows-unread.md): actions
  like Mark as Unread un-read your own mail, and Sent shows a count; the 24 on
  `ih` are old.

- [Search inside attachments](tickets/009-search-inside-attachments.md):
  text attachments are searched already; PDF and Office need extraction in
  Stalwart; Suite shows no snippets.

- [Heuristic audit of the running app](tickets/001-heuristic-audit.md): 95
  findings; worst are no account shown in All accounts, Reply All as the only
  quick reply, Archive and Trash hidden on desktop, risky recipient picks.

- [Feature gap survey](tickets/002-feature-gap-survey.md): 29 gaps; top are
  categories, unsubscribe, a rule builder, templates, swipe actions, snooze
  and reminders; AI needs an outside service.
- [Mail problems reported on GitHub](tickets/005-github-issues-survey.md): 134
  issues in 29 problem groups; worst are rows misdescribing threads, verdicts
  not reaching old mail, late updates, drafts losing work.

## Not yet specified

- Phone-specific flows beyond what the audit found: gestures, the bottom
  nav's space, and whether the phone list should differ from the desktop's.

## Out of scope

- Admin screens (dashboard, domains, accounts, DMARC and TLS reports),
  import and export job pages, and the sign-in, sign-up and password-reset
  pages.
- Calendar. It gets its own map later.
- Pixel tracking of when recipients open mail (survey G16): privacy-hostile
  and recommended against. Ruled out in
  [The user's pain list](tickets/003-pain-list.md).
- Calendar beside mail (G27): Calendar gets its own map; RSVP in the thread
  exists, and creating an event from a mail is in fixes.md.
- Merging threads, renaming subjects, replying to many at once (G28): low
  value, and needs a Suite layer over threads the server computes.
