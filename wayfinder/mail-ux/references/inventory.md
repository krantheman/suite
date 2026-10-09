# Mail UI inventory (2026-10-09)

Facts from the code, `frontend/src/apps/mail/` (`M/` below). Admin screens are out of scope and omitted.

## Routes

- `all/:folder[/account/:accountId/:threadID]`: one folder merged across accounts (`UnifiedFolderView.vue`).
- `account/:accountId/mailbox/:mailbox[/:threadID]`: list plus reading pane (`MailboxView.vue`); also `starred` and `search`.
- `account/:accountId/compose`: full-page composer, phone only; desktop docks a window.
- `account/:accountId/profile`: phone Profile tab (settings list, account switcher).
- `account/:accountId/outbox[/:submissionId]`: outgoing mail, status, delivery activity.
- `screener/*` redirects to the Inbox; `contacts/*` redirects to People.

## Surfaces

- List: `ThreadPane`, `MailListItem`, `MailListToolbar`, day/month group headers, sender stacks of 3+, split or full width.
- Thread: `MailThread` (folding, inline reply with pop-out), `ThreadHeader`, `MailActions`; banners for hidden images, calendar invites, delivery status, unknown senders.
- Compose: one window at a time, modal or docked or minimised; recipients with contact suggestions and a picker; @mentions; schedule send; undo send.
- Search: command palette with filters (From, To, Cc, Bcc, Subject, dates, attachments, read state, folder, all accounts), remembered searches.
- Sidebar: account switcher, folders, "More", quota; drag threads onto folders.
- Settings tabs: Credentials, Account, Identity, Layout (desktop), Folders, Signatures, Compose, Vacation Response, Automation (raw Sieve), Push Subscriptions, Screener, Import, Export, Advanced.
- Phone: bottom nav, folder sheet, swipe between threads, mobile selection and search.

## Features

- Present: scheduled send, undo send, undo last action, folders (colour, icon, auto-star, auto-read, per-folder push mute, sender auto-move), multiple accounts and All Inboxes, keyboard shortcuts (`ShortcutsModal.vue`), drag and drop, bulk actions, conversation threading, push notifications, attachment preview, remote image blocking, delivery tracking, unknown-sender screening, block sender, trust a domain, junk, star, mark unread from here, .eml download and MIME source, calendar RSVP, mailto links, dark-mode rendering, import and export.
- Partial: labels (a thread can be in several folders; no label UI), filters (raw Sieve plus folder sender rules), read receipts (seen in Outbox; can't be requested).
- Backend only: categories (Primary, Promotions, Social, Updates, Forums, by headers).
- Absent: snooze, templates, unsubscribe, print, reactions (picker mode unused), PGP/S-MIME, offline, several composers at once (#407).

## Known debt in comments

- Draft edits don't reach the list until the editor closes (`useComposeMail.ts`).
- Sender stacks key on name plus address, so mailing lists rarely stack (`threadStacks.ts`).
- Open-row tint is desktop only (`useListRows.ts`).
- Filters mean writing Sieve (`AutomationSettings.vue`).

## Domain docs

None for Mail: no `suite/mail/CONTEXT.md`, specs or ADRs. `CONTEXT-MAP.md` lists Mail as not charted.
