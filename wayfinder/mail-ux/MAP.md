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
and mobile web: the mailbox lists and All Inboxes, the thread view, compose,
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

- [Heuristic audit of the running app](tickets/001-heuristic-audit.md): 95
  findings; worst are no account shown in All Inboxes, Reply All as the only
  quick reply, Archive and Trash hidden on desktop, risky recipient picks.

- [Feature gap survey](tickets/002-feature-gap-survey.md): 29 gaps; top are
  categories, unsubscribe, a rule builder, templates, swipe actions, snooze
  and reminders; AI needs an outside service.
- [Mail problems reported on GitHub](tickets/005-github-issues-survey.md): 134
  issues in 29 problem groups; worst are rows misdescribing threads, verdicts
  not reaching old mail, late updates, drafts losing work.

## Not yet specified

- Features missing today that the survey will weigh: snooze, templates,
  unsubscribe, print, reactions (a picker mode exists, unused), a visual rule
  builder over Sieve, requesting read receipts, offline.
- Known debt: one composer at a time; draft edits not shown in the list until
  the editor closes; sender stacks rarely group mailing lists.
- Mobile-specific flows beyond what the audit finds.

## Out of scope

- Admin screens (dashboard, domains, accounts, DMARC and TLS reports),
  import and export job pages, and the sign-in, sign-up and password-reset
  pages.
- Calendar. It gets its own map later.
