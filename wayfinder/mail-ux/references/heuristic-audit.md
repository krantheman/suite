# Heuristic audit of Suite Mail (2026-10-09)

## Method

- Walked the running app at `su1.localhost:8081/mail` in the user's signed-in browser (Dia, through Claude in Chrome). Two mail accounts were connected.
- Desktop: viewport about 1316×855. Phone: the browser wouldn't resize its window, so the app was loaded in a 390×844 same-origin frame. That renders the phone layout from width breakpoints only. The frame is not a touch device and has no phone user agent, so touch-only paths (`hover: none`) and anything gated on a phone check were not seen. Those points are marked "code" where the code was read to confirm.
- Lens: Nielsen's ten heuristics (H1 visibility of status, H2 match with the real world, H3 user control and freedom, H4 consistency and standards, H5 error prevention, H6 recognition over recall, H7 flexibility and efficiency, H8 minimalist design, H9 error recovery, H10 help), plus mail-specific checks.
- Frequency: daily, weekly or rare, for a work-mail user. Severity: 1 cosmetic, 2 minor, 3 major, 4 blocks the task.
- No mail content, subjects or real names appear here. Problems are described generically.

**Exercised:** All Inboxes and single-account lists (split and full width); the filter menu; the account switcher; More; hover row actions; group and bulk selection (cleared again); opening threads; thread and message menus; the hidden-images and unknown-sender banners (looked at, not answered); compose as modal, docked and minimised; recipient suggestions; Cc/Bcc; the Send menu; the From menu; the search palette, instant results, the results page and advanced filters; every Mail settings tab (no saves); Notifications; Outbox (list and detail); Drafts, Trash, Junk and Sent; the shortcuts modal; j/k; Esc; ⌘K. On phone: list, folder sheet, thread, thread action sheet, Account sheet, Profile page (by URL), full-page compose and its menu, search, avatar-tap selection.

**Not exercised:** sending; the schedule picker (blocked by the session's permission check); answering the unknown-sender banner, including its Yes menu (blocked too); block or trust; archive, trash, junk and the Undo toasts that follow them; Delete Now; permanent delete; settings saves; calendar RSVP; the delivery-status banner; attachment preview; drag and drop; push notifications; dark mode; offline and server-error states.

**Side effects:** threads opened during the walk were marked read; one was marked unread again by a stray tap on phone, which put it back to its original unread state. A recent-search entry ("invoice") now sits in the user's search history. Split view was toggled off and back on. No draft was left behind: compose was opened and closed while empty.

---

## Mailbox list and All Inboxes

**A01. In All Inboxes, rows don't say which account they belong to.** Rows of the default account carry no marker. Only rows of the other account get a small blue "· in ‹local part›" suffix after the sender, styled like a link. So whether a row is marked depends on which account is the default, not on anything the user picked. H1, H4; wrong-account risk. Daily, severity 3. *Hint: a symmetric marker on every row (colour chip or initial) once there are two or more accounts.*

**A02. All Inboxes has no row checkboxes or select-all.** The single-account view shows a checkbox on every row and in the toolbar; All Inboxes shows none. Bulk work there is mouse-invisible (shortcuts only). H4, H7. Daily, severity 3. *Hint: one list component for both views.*

**A03. All Inboxes doesn't mark unknown senders in the list.** The single-account Inbox shows the unknown-sender icon after the name; the same rows in All Inboxes show nothing. The banner does still appear inside the thread. H4, H1. Daily, severity 2.

**A04. Split-view rows are tall.** Each split-view row is three lines and 89px high, so about seven threads fit on an 855px screen; day headers take more space on top. Full width uses one line per row, which is much denser. There is no density setting. H7, H8. Daily, severity 2.

**A05. Checkboxes eat the narrow list column.** In the single-account view, an always-visible checkbox takes about 30px from a list column of about 350px. Long sender names truncate earlier than in All Inboxes. H8. Daily, severity 1.

**A06. Sparse folders turn into a stack of day headers.** Every day group gets a 48px header with its own checkbox and collapse chevron. In Trash and Junk, most headers sit over a single row. H8. Weekly, severity 1.

**A07. Hover actions are bare, small icons.** Mark read, Archive and Trash appear on row hover as 20px icons with no accessible names. Trash sits right next to Archive. H5, H6. Daily, severity 2.

**A08. Many icon buttons have no accessible names.** List toolbar buttons (filter, refresh, split toggle), folder kebabs and row stars have none; one desktop screen counted 32. Screen readers can't use them, and nothing is named until the tooltip appears. H6 (accessibility). Daily, severity 2.

**A09. The filter control says "All Mails", its option says "All".** The trigger reads "All Mails" and the menu option reads "All". "Mails" also shows up in shortcut labels. H4 (copy). Daily, severity 1.

**A10. Unread counts appear where unread means nothing.** Sent shows 24, Junk 73 and Trash 5, and the browser tab title echoes them ("(24) Sent", "(5) Trash"). A count on Junk invites attention to spam. H8. Daily, severity 2.

**A11. Inbox shows two different numbers.** The desktop sidebar and tab title show the unread count. The phone header shows a total ("6,345 threads"). Neither is labelled. H4, H1. Weekly, severity 1.

**A12. Selecting a day group is too easy and its state doesn't show.** One click on a day header's checkbox selected all seven threads of that day. The toolbar select-all checkbox stayed empty (no indeterminate state) while "7 items selected" showed. H1, H5. Weekly, severity 2.

**A13. Desktop bulk bar hides Archive and Trash.** With rows selected, the desktop toolbar shows "…", Move and Add icons; Archive and Trash are inside "…". The phone selection bar puts them one tap away. H4, H7. Daily, severity 2.

**A14. Opening a thread marks it read at once.** Clicking a row or moving with j/k marks the thread read instantly, so skimming with j/k clears unread state on every thread passed. There's no delay and no setting. H3. Daily, severity 2.

**A15. Attachment chips are unreadable.** Chips in rows truncate the file name to 3–4 characters, which doesn't identify the file. H8. Daily, severity 1.

**A16. The open-row accent outlives the reading pane.** After Esc closes the reading pane, the left accent stays on the last-opened row, so it looks still open. H1. Rare, severity 1.

**A17. The page title links to a broken URL.** The "Inbox" title in the header links to `…/mailbox/a`. A normal click is intercepted, but open-in-new-tab or middle-click goes to a folder that doesn't exist. H4. Rare, severity 1.

**A18. Empty Trash/Junk is a ghost button with a vague confirm.** The banner in Trash and Junk has "Delete Now" as a quiet ghost button. Per the code, its dialog asks "Are you sure you want to empty the contents of this mailbox?" with a "Confirm" button. It names no count, doesn't say the deletion is permanent, and the button doesn't say "Delete forever". Not clicked. H5. Weekly, severity 3.

**A19. Opening Trash gives a long bare spinner.** Trash took about 3–4 s behind a centred "Loading…" with no list skeleton, while other folders appear at once. H1. Weekly, severity 1.

## Thread view

**A20. Archive and Trash are two clicks away.** The desktop thread toolbar has Star, Move To, Add To, "…" and previous/next. Archive (E) and Move to Trash (Delete) only live in "…". The most frequent triage actions take two clicks or a memorised key. H7, H6. Daily, severity 3.

**A21. Desktop reply buttons sit at the end of the thread.** Reply, Reply All and Forward only appear after the last message; on a long newsletter the user scrolls the whole body to find them. The message header offers just one quick icon. Phone has a sticky reply bar. H7, H4. Daily, severity 2.

**A22. The one quick reply icon is Reply All.** Each message header's single quick-reply icon is Reply All, even on mail sent to a group alias, and plain Reply is inside "…". It's easy to answer everyone by reflex. H5. Daily, severity 3.

**A23. Move To and Add To look alike and sit together.** The two folder icons are near-identical, side by side. "Add To" exposes labels (a thread in several folders) when the app has no label UI anywhere else. H2, H4, H6. Weekly, severity 2.

**A24. Thread and message actions overlap without saying which they act on.** There are two stars, one on the thread toolbar and one per message. Junk, Trash and Unread appear in both the thread menu and the message menu, and neither says which scope it acts on. H4. Weekly, severity 2.

**A25. The message menu mixes routine, risky and technical items.** One flat 13-item list holds Reply/Forward, Block Sender, Mark Domain as Trusted, Filter Sender's Messages, Download Email, See MIME Message and, for admins, View in Desk. Shortcut hints appear in the thread menu but not here. H8, H5. Weekly, severity 2.

**A26. Mark Domain as Trusted gives no sense of scope.** It is offered for any sender's domain, including big shared or marketing domains, with no hint of how much mail that lets through. Not exercised, so it's unknown whether it warns. H5. Rare, severity 3.

**A27. Wide HTML mail gets clipped.** On desktop, with sidebar and list open, a newsletter's text was cut mid-word at the right edge of the reading pane. On phone, the message frame was about 650px wide inside a 362px column and needs horizontal panning inside the message. H8 (reading comfort). Daily, severity 3.

**A28. Thread and list show different time formats.** The thread shows relative time ("5 hours ago") while the list shows clock time for the same message. H4. Daily, severity 1.

**A29. The receiving account is invisible in an All Inboxes thread.** The header shows "to ‹alias›", but nothing says which of the user's accounts got the mail. That matters when it came through a group alias, and the reply's From isn't visible until the composer opens. H1; wrong-account risk. Daily, severity 3.

**A30. Unsubscribe isn't surfaced.** For newsletters, the only way out is the sender's link in the footer. H7. Weekly, severity 2 (feature gap already listed in the map).

**A31. The images banner only shows them once.** The hidden-images banner offers "Show" for this time only. There's no "always for this sender" except by answering Yes on the unknown-sender banner, which only exists for unknown senders. H7. Weekly, severity 1.

**A32. The tab title differs between views.** The browser tab shows the subject in the single-account view but just "Mail" for the same thread opened from All Inboxes. H4. Rare, severity 1.

**A33. View in Desk shows up in an end-user menu.** For admins, "View in Desk" appears in the message menu, a Frappe admin term (code: shown to System Managers). H2, H8. Rare, severity 1.

## Unknown senders

**A34. The unknown-sender marker is a faint 12px icon.** It sits after the sender name in grey, and its meaning only appears in a hover tooltip, so there's no way to learn it on touch. Full-width rows in All Inboxes show no marker at all (see A03). H6, H10. Daily, severity 2.

**A35. The banner's No doesn't say what it does.** "Do you want mail from ‹sender›?" with No and Yes. Per the code, No moves the whole thread, mail from known senders included, to Junk and refuses the sender, with an Undo toast. Yes also lets their images in for good. The banner states neither. H1, H5. Weekly, severity 3. *Hint: name the outcome on the button or a sub-line.*

**A36. Screening has three vocabularies.** The banner says Yes/No, the Settings → Screener table says Accept/Block, and the code says allow/deny. The Screener settings text still says new senders "go to the Screener instead of your Inbox", though screened mail now waits in the Inbox. H4, H2. Weekly, severity 2.

**A37. "Screen New Senders" lives in two tabs.** The toggle appears in both Settings → Account and Settings → Screener. H4. Rare, severity 1.

## Compose

**A38. The desktop composer is a modal over everything.** It opens as a large centred modal with a dimmed backdrop over the list and thread, so the user can't refer to the mail they're answering. Docking exists but sits behind an unlabelled icon. H6, H7. Daily, severity 2.

**A39. Compose header icons are unlabelled.** Minimise (chevron), dock (arrows) and close carry no accessible names on desktop. Tooltips only help on hover ("Minimise"), and the difference between minimise and dock isn't evident. H6. Weekly, severity 2.

**A40. The composer collapsed after a click inside it.** With the Send menu open, a click in the body area to dismiss it collapsed the composer to the minimised bar. The next click then landed on the list underneath and selected a whole day group. Seen once. H3, H5. Weekly, severity 3.

**A41. Cc and Bcc hide behind a chevron.** On desktop they're revealed by an unlabelled chevron at the far right of the To row, with no "Cc Bcc" text. H6. Weekly, severity 2.

**A42. Recipient suggestions make picking the wrong address easy.** Suggestions show the name large and the address small and grey. The same person at two domains appears as two near-identical rows, and the list covers the Subject field. H5. Daily, severity 3.

**A43. From doesn't stand out across accounts.** A new message from All Inboxes defaults From to the default account, shown as a grey chip like any other field. Nothing draws attention to it when several accounts exist. H1; wrong-account risk. Daily, severity 2.

**A44. Discard sits next to Send and is styled inconsistently.** On desktop it's a neutral button of the same size with a trash icon, directly left of Send. On phone it's red inside the ⋮ sheet. Whether it confirms wasn't exercised. H5, H4. Daily, severity 2.

**A45. Schedule send is hidden.** It sits behind the Send split arrow on desktop and in the ⋮ sheet on phone, with no hint elsewhere. On desktop the arrow opens even while Send is disabled. H6. Weekly, severity 1.

**A46. You can't tell whether a signature will be added.** A new message showed an empty body. Identity has a "Default Signature" with content, yet Signatures says "No signatures found", and Drafts held a stray draft containing only that signature. H1, H4. Daily, severity 2.

**A47. On phone, attaching waits until you type.** The formatting row and Attach only appear once the body has focus (code: `isBodyFocused`). Before that there's no visible way to attach, and the header targets are 28×28. H6. Weekly, severity 2.

**A48. Draft rows wear a red badge and an italic placeholder.** In Drafts, a row shows "Me" plus a red "Draft" badge, redundant there, and red reads as an error. Subject-less drafts show an italic "(No subject)". H8. Weekly, severity 1.

## Search

**A49. Search doesn't show its scope.** The palette says only "Search" and doesn't state which account it covers. "Search across all accounts" is a toggle deep in advanced filters, off by default even from All Inboxes, so results can silently miss the other account. H1. Weekly, severity 2.

**A50. Instant results don't show why they matched.** When the match is in the body, the result shows no highlight or snippet. H1. Weekly, severity 2.

**A51. "See all results" is at the bottom of a scrolling list.** It's the last option in the palette's list, and Enter opens the first thread instead. H6, H7. Weekly, severity 2.

**A52. The results page can't refine.** It has a text box and a count but no filter chips; refining means reopening the palette. H7. Weekly, severity 2.

**A53. Advanced filters are cramped.** The account toggle, Look In, Subject, From, To, Cc, Bcc and more are packed into the palette and need scrolling. H8. Weekly, severity 1.

**A54. The empty palette suggests app settings, not mail.** It offers "Settings" and "Switch to dark theme". Recent searches appear only after the first search. H8. Weekly, severity 1.

## Sidebar and folders

**A55. Archive sits under More with Junk and Trash.** Archive, the most common destination after Inbox, is collapsed under "More". H6. Weekly, severity 1.

**A56. The All accounts sidebar has no Outbox and no New Folder.** Pending and scheduled mail needs a switch to one account, and creating a folder needs one too. H4. Weekly, severity 2.

**A57. The account switcher is bare.** It lists the two addresses with no unread counts and "All accounts" last, and there's no entry to add or manage accounts. H1. Weekly, severity 2.

**A58. Folder groups use implementation labels.** They're called "Default" and "Custom". H2. Daily, severity 1.

**A59. The rail's red dot disagrees with Notifications.** The Mail icon in the app rail shows a red dot with no count, while the Notifications panel says "No notifications". H1, H4. Daily, severity 1.

**A60. Storage only appears in the sidebar once it's critical.** By design (code). Otherwise it lives in Settings → Account, which is hard to find when the user wonders why mail bounces. H1. Rare, severity 1.

## Notifications and feedback

**A61. The Notifications panel has no mail in it.** It says "No notifications" with an active "Mark all read" link, and mail arrivals never appear there. H1. Daily, severity 1.

**A62. Phone toasts cover the bottom nav.** "Thread marked as unread" sat over the tab labels for more than 6 s. H8. Daily, severity 2.

**A63. Toasts and Undo arrive late.** Action toasts and their Undo only appear once the server confirms (code: `raiseOptimisticToast` waits on the request), while the list has already changed. On a slow link, the "it worked / Undo" signal arrives after the user has moved on. H1, H3. Daily, severity 2.

## Outbox

**A64. The status reads "Final" in the list and "Sent" in the detail.** The detail adds "Sent · Accepted by the mail server, no delivery report yet". "Final" doesn't say delivered or failed. H2, H4. Weekly, severity 2.

**A65. Outbox speaks system language.** Tabs read "Pending / Final / Cancelled", and the empty state talks about "submissions". H2. Weekly, severity 1.

**A66. Raw transport data gets equal weight in the detail.** The detail shows SMTP reply codes, an Envelope block and raw Identifiers at the same weight as the human-readable status. H8. Weekly, severity 1.

**A67. "Remove" is ambiguous.** In the submission detail, it could delete the mail or just the record. Not exercised. H5. Rare, severity 2.

**A68. Outbox is much smaller than Sent, with no explanation.** Outbox held 2 entries while Sent had 24, and nothing says how long Outbox keeps items. H1. Rare, severity 1.

## Mail settings

**A69. Settings never say which mail account they apply to.** With two accounts connected, the Account, Identity, Layout, Folders, Signatures, Screener and Vacation tabs name no account, and there's no account picker in the modal. H1; wrong-account risk. Weekly, severity 3.

**A70. Destructive toggles mix with routine ones.** "Delete Email After Sending" and "Delete Newsletter After Sending" sit among routine toggles, with no warning about losing the sent copy. "Newsletter" is undefined. H5, H2. Rare, severity 3.

**A71. Settings opens on Profile.** Opened from Mail, the modal lands on Profile, and the Mail section is a 14-item rail below Account and Drive. H7. Weekly, severity 1.

**A72. Signatures live in two places that disagree.** Identity has a "Default Signature" editor with content; Signatures says "No signatures found" (see A46). H4. Rare, severity 2.

**A73. The Identity picker shows an internal id.** It reads "‹address› (g)". H2. Rare, severity 1.

**A74. Vacation Response shows stale defaults.** The dates are from last year, the subject is prefilled "Text More", and the native date fields use DD/MM/YYYY. The fields stay editable while the responder is off. H1, H2. Rare, severity 2.

**A75. Filters mean writing Sieve.** Automation shows "No sieve scripts found" and a "Rebuild Automation" button; that is the only general filter tool (known debt). H2. Weekly, severity 2.

**A76. Push Subscriptions lists bare device ids.** Each row is a raw UUID with no device name or last-used date, so the user can't tell which to remove. H2, H6. Rare, severity 2.

**A77. Admin-level settings sit in the end-user list.** Credentials (server URL, app password) and Advanced (API keys) appear among everyday Mail settings. H8. Rare, severity 1.

**A78. The Compose tab holds one short setting.** Its only setting is Undo Send, defaulting to 5 seconds. H8. Rare, severity 1.

**A79. The Screener table overflows.** It's wider than the settings panel and the Last Modified column is clipped. H8. Rare, severity 1.

## Keyboard

**A80. "Clear All Mails" sounds destructive.** The shortcuts modal names Esc "Clear All Mails"; it clears the selection. "Select All Mails" has the same wording. H2. Weekly, severity 2.

**A81. ⌘Z does three jobs, and ⌘D takes over a browser shortcut.** ⌘Z is listed as both Undo Send and Undo Last Action, besides text undo in the editor. ⌘D (Discard Draft) overrides the browser's bookmark shortcut. H5. Weekly, severity 2.

**A82. Common shortcuts are missing or clash with convention.** There are none for Star, Move to folder or Add to folder. "G then F" goes to Starred while F alone is Forward, and "G then S" is Sent, unlike the common Gmail mapping. H4, H7. Weekly, severity 2.

**A83. Esc closes the thread before clearing a selection.** With rows selected and a thread open, Esc closes the thread and leaves the selection. H4. Weekly, severity 1.

**A84. The first key after the shortcuts modal is lost.** After closing the modal, the first j didn't move to the next thread, because focus went back to a button. H7. Rare, severity 1.

**A85. Shortcut hints are uneven.** They show in the thread "…" menu and the bulk menu, but not in the message menu or on hover row actions. H6. Weekly, severity 1.

## Phone

**A86. The bottom nav carries all seven Suite apps.** Home, Drive, Mail, Calendar, Meet, People and Account get about 56px each with small labels. Mail's own destinations (folders) sit behind the hamburger. H8, H7. Daily, severity 2.

**A87. Touch targets are small.** Folder sheet rows are 28px high, the "More" toggle is 51×16, row stars are 20×20, and compose header buttons are 28×28. All are below 44pt. H5 (touch). Daily, severity 2.

**A88. The compose FAB covers a row.** It overlaps the star and time of the row underneath, and there's no bottom padding to scroll it clear. H8. Daily, severity 2.

**A89. Phone and desktop lists differ.** Phone shows avatars and no day headers; desktop shows day headers and no avatars. H4. Weekly, severity 1.

**A90. Phone selection has no visible way in.** It starts by tapping the avatar, with no affordance. The selection bar puts Junk between Archive and Trash. H6, H5. Weekly, severity 2.

**A91. Phone settings have two homes.** The Account tab opens a sheet (Settings, Theme, Log out). A separate Profile page, linked from the folder sheet on phones (code), holds the account switcher and the settings list. H4. Weekly, severity 1.

**A92. Log out sits close to Settings.** In the Account sheet it comes right after Settings and Theme, with the same styling and no separation. H5. Rare, severity 2.

## Copy and terminology (cross-cutting)

**A93. Casing is inconsistent.** Tooltips and settings labels use Title Case ("Move To", "Create Contacts After Sending Email"); buttons and menus elsewhere use sentence case ("Schedule send", "Attach files"). H4. Daily, severity 1.

**A94. Spelling mixes British and US English.** "Minimise" in the composer, "Organize" in Layout settings. H4. Rare, severity 1.

**A95. The noun keeps changing.** The same thing is called "Mail", "Mails", "Email", "message" and "thread" ("Compose Mail", "Select All Mails", "Download Email", "Thread marked as unread"). H4. Daily, severity 1.

---

## Top 15 (severity × frequency; daily 3, weekly 2, rare 1)

| # | ID | Finding | Sev | Freq |
|---|----|---------|-----|------|
| 1 | A01 | All Inboxes rows don't say which account they belong to | 3 | daily |
| 2 | A29 | Thread in All Inboxes doesn't show the receiving account | 3 | daily |
| 3 | A22 | The only quick-reply icon is Reply All | 3 | daily |
| 4 | A20 | Archive and Trash buried in the thread "…" menu | 3 | daily |
| 5 | A42 | Recipient suggestions make the wrong address easy to pick | 3 | daily |
| 6 | A27 | Wide HTML mail clipped (desktop) or panned (phone) | 3 | daily |
| 7 | A02 | All Inboxes has no checkboxes or select-all | 3 | daily |
| 8 | A35 | Unknown-sender "No" doesn't say it junks the thread | 3 | weekly |
| 9 | A69 | Mail settings don't say which account they change | 3 | weekly |
| 10 | A18 | Delete Now confirm doesn't say count or permanence | 3 | weekly |
| 11 | A40 | Composer collapsed after a click inside it; next click hit the list | 3 | weekly |
| 12 | A14 | Opening or j/k marks threads read instantly | 2 | daily |
| 13 | A13 | Desktop bulk bar hides Archive and Trash (phone shows them) | 2 | daily |
| 14 | A87 | Phone touch targets below 44pt | 2 | daily |
| 15 | A21 | Desktop reply buttons only at the end of the thread | 2 | daily |

## Counts by surface

| Surface | Findings |
|---------|----------|
| Mailbox list and All Inboxes | 19 (A01–A19) |
| Thread view | 14 (A20–A33) |
| Unknown senders | 4 (A34–A37) |
| Compose | 11 (A38–A48) |
| Search | 6 (A49–A54) |
| Sidebar and folders | 6 (A55–A60) |
| Notifications and feedback | 3 (A61–A63) |
| Outbox | 5 (A64–A68) |
| Mail settings | 11 (A69–A79) |
| Keyboard | 6 (A80–A85) |
| Phone | 7 (A86–A92) |
| Copy and terminology | 3 (A93–A95) |
| **Total** | **95** |
