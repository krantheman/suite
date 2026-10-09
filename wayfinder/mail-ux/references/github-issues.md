# Mail problems reported on GitHub

Date: 2026-10-09. Answers [ticket 005](../tickets/005-github-issues-survey.md).

## Method

- **frappe/suite**: every issue with the `mail` label (73, open and closed), and the titles of all 163 issues in the repo checked for unlabelled Mail ones. Four unlabelled ones were read; one (#488) was kept. Bodies and comments of all 73 labelled issues were read.
- **frappe/mail** (archived, all closed): all 181 titles checked; 99 that looked like end-user Mail UX were read with their comments.
- **Skipped**: admin, domains, DMARC/TLS, tenants and invites; import/export jobs; login, signup and install errors; Calendar-only issues; backend refactors with no user-facing effect (e.g. suite#33, #55, #237, #528, #530); the native NativeScript app tickets (suite#63–66, mail#484–490), which are not mobile web.
- **Kept**: 134 issues (54 suite, 80 mail) in 29 groups. A further 3 suite issues are listed under "Not kept". Groups I25–I29 are fixed problems, kept so they aren't reported again.
- **Still happens today?** comes from a read-only check of `frontend/src/apps/mail` (`M/` below) and `suite/mail`, or is marked unverified. Nothing was run in a browser.
- G-ids refer to [feature-gap-survey.md](feature-gap-survey.md).
- **Frequency** means how often a typical work user would hit the problem: daily, weekly or rare.

## Groups

### The list

**I01 New mail and changes made elsewhere reach the list late, or only after a refresh**
- [mail#85](https://github.com/frappe/mail/issues/85) Replied email only shows up after refresh
- [mail#194](https://github.com/frappe/mail/issues/194) Realtime doesn't seem to be working
- [mail#441](https://github.com/frappe/mail/issues/441) Auto refresh inbox
- [suite#171](https://github.com/frappe/suite/issues/171) `get_threads` is not called when mailboxes count changes (closed, not planned)
- [mail#258](https://github.com/frappe/mail/issues/258) Reopening draft mail repeatedly creates it to refer to the original draft
- Still happens: **partly**.
  - `MailboxView.vue` and `UnifiedFolderView.vue` listen for `new_mail_created` and `mail_changed` on the socket, and also poll every 30 s.
  - Where the server's push doesn't arrive (it needs webhooks over HTTPS), the poll is all that's left, so changes can take up to 30 s to show.
  - Draft edits still don't reach the list until the editor closes (inventory: known debt).
- Frequency: daily.
- Note: mail#441 asked for a poll, and the poll was added because JMAP push was unreliable then. The poll hides the cause instead of fixing it. The underlying problem is that the list doesn't track changes on the server.

**I02 A list row doesn't describe its thread: the date, star, preview or sender come from different messages**
- [suite#404](https://github.com/frappe/suite/issues/404) Mail list can order the Yesterday group above Today (open)
- [suite#894](https://github.com/frappe/suite/issues/894) Mail: a thread shows up in Starred with a hollow star (open)
- [suite#416](https://github.com/frappe/suite/issues/416) Sent Items renders a multi-message thread as a single sent mail, with no cue which message was clicked (open)
- [suite#97](https://github.com/frappe/suite/issues/97) fix: preview text
- [mail#476](https://github.com/frappe/mail/issues/476) Preview of mail is that of the last mail in the workbox, not the thread
- [mail#310](https://github.com/frappe/mail/issues/310) Previews are off
- [mail#387](https://github.com/frappe/mail/issues/387) Email sorting by date is not working correctly (server index; not planned)
- [mail#83](https://github.com/frappe/mail/issues/83) Should display full date time on hover (not planned)
- Still happens: **partly**.
  - suite#404 looks fixed in code even though the issue is open: `serialize_thread` (`suite/mail/api/mail.py`) now dates a row by its newest message in the current mailbox.
  - suite#894 still happens. The Starred list uses `someInThreadHaveKeyword: $flagged`, the row star comes from one message (`current = messages[-1]`), and the header star needs every message starred (`ThreadHeader.vue:200`, `thread.every((m) => m.flagged)`).
  - suite#416 is partly fixed: a Sent row now shows a message count, but nothing marks which message was clicked.
  - The list date tooltip is turned off on purpose (`MailDate.vue`, `:disabled="inList"`).
- Frequency: daily.
- Note:
  - Each issue fixes one field. Within a single row, different fields come from `current`, `latest` and `first`, under different rules, and the header uses yet another rule.
  - The fix for the root cause is one rule for which message stands for a thread in a given view, with every field and both stars reading from it.
  - The open PR #402 fixes the star only inside Starred.

**I03 Selecting many threads doesn't behave as expected**
- [suite#161](https://github.com/frappe/suite/issues/161) Keyboard multi-selection removes 2 items at a time when moving down (open)
- [mail#281](https://github.com/frappe/mail/issues/281) Improved Thread Select
- [mail#242](https://github.com/frappe/mail/issues/242) Allow selecting all (not planned)
- [mail#456](https://github.com/frappe/mail/issues/456) Add pagination with result range indicator
- Still happens: **yes**.
  - `handleArrowNavigation` (`M/pages/MailboxView.vue`) toggles both the previous row and the new row on each Shift+arrow, so changing direction deselects two rows at a time. Nothing records where the selection started.
  - Select all (`toggleSelectAll`) only covers the threads already loaded.
  - Whether a large folder shows a "1–50 of N" count is unverified.
- Frequency: weekly, daily for keyboard users.
- Note: the fix is a selection anchor (range from anchor to cursor), as Gmail and Finder do it, not a tweak to the stepping. Selecting every thread in a folder was declined because JMAP has no "all" target. A server-side "apply to the whole folder" action is a separate decision.

**I04 Bursts of similar automated mail (incidents, newsletters, notifications) fill the list**
- [mail#305](https://github.com/frappe/mail/issues/305) Option to enable virtual thread/grouping based on subject, sender and date (not planned)
- [mail#48](https://github.com/frappe/mail/issues/48) Transfer low-priority emails (newsletters) in batch
- Still happens: **yes**. Sender stacks key on name plus address (`M/utils/threadStacks.ts`), so mailing lists and alert senders rarely stack (inventory: known debt). Categories are classified on the backend but not shown in the UI.
- Frequency: daily.
- Note:
  - mail#305 was closed because grouping on the client would make the counts inconsistent.
  - The underlying problem is noise in the list, not threading. Bundles or categories address it without faking threads.
  - Related gaps: G07, G06, and "Sender stacks vs bundles" in the survey.

**I05 A thread spread across folders behaves unexpectedly when you move it, reply to it, or mark it unread**
- [mail#443](https://github.com/frappe/mail/issues/443) After a new reply, a thread should move back to inbox
- [mail#472](https://github.com/frappe/mail/issues/472) Threads / mails sent should always remain in "Sent" even if they are moved to other folders
- [suite#73](https://github.com/frappe/suite/issues/73) auto move mail(s) to Inbox on "Mark as Unread" from Archive (not planned)
- Still happens: **partly, unverified**. "Add to folder" exists, and archiving from Sent adds rather than moves (`MailboxView.vue`, key `e`). Whether a thread that is partly back in the Inbox offers "move all back" was not checked.
- Frequency: weekly.
- Note:
  - A thread is a set of messages that can sit in different mailboxes, but the UI shows folder membership as if it belonged to the whole thread.
  - Each report patches one case. A labels-style model (G09) would answer all three.

**I06 Folders can't be nested or ordered, and unsubscribed folders disappear without a trace**
- [suite#41](https://github.com/frappe/suite/issues/41) Custom Mailboxes/Folders (open: nesting and sorting unchecked)
- [mail#208](https://github.com/frappe/mail/issues/208) JMAP Mailbox Management
- [mail#212](https://github.com/frappe/mail/issues/212) Failed to move email(s) to mailbox
- [mail#603](https://github.com/frappe/mail/issues/603) Default Mail Folders Missing After Recreating User Account (not planned)
- Still happens: **yes**.
  - The frontend never reads `parentId`, so folders from other clients show up flat.
  - `is_listed_mailbox` (`suite/mail/api/mail.py`) hides unsubscribed non-system folders. The only way to find them is Settings > Folders.
- Frequency: weekly, for anyone who used folders in another client.
- Note: G09 (labels UI) overlaps. Decide nesting and labels together.

### Reading

**I07 Some third-party mail renders differently from other clients**
- [suite#58](https://github.com/frappe/suite/issues/58) UI: Support for Table in mail content (open)
- [suite#52](https://github.com/frappe/suite/issues/52) UI: Support for Plain Text
- [mail#374](https://github.com/frappe/mail/issues/374) Broken code formatting in email renderer
- [mail#201](https://github.com/frappe/mail/issues/201) Email viewport fixed height
- [mail#384](https://github.com/frappe/mail/issues/384) links in marketing emails open within the mail
- [mail#349](https://github.com/frappe/mail/issues/349) Broken inline images (incoming `cid:` half)
- Still happens: **partly**. Plain text was fixed in suite PR #711, and links, frame height and code blocks were fixed earlier. Tables are unverified: `EmailContent.vue` caps table width, but #58 is still open and its body shows the table rendering blank.
- Frequency: weekly.
- Note: these were fixed one sender at a time. A regression set of real-world messages, checked against another client, would catch the next one.

**I08 In dark mode some mail is unreadable, and there's no way to see it as sent**
- [suite#57](https://github.com/frappe/suite/issues/57) Theme toggling in thread (open)
- [suite#42](https://github.com/frappe/suite/issues/42) Color scheme sometimes overwrites text color when it shouldn't
- [suite#36](https://github.com/frappe/suite/issues/36) Dark mode doesn't work properly on Firefox
- [suite#405](https://github.com/frappe/suite/issues/405) Share notification emails are unreadable in dark mode and unstyled in light
- [suite#1](https://github.com/frappe/suite/issues/1) fix: flashbang while login (open)
- Still happens: **partly**.
  - `M/utils/darkMail.ts` now remaps every colour in OKLab in a deterministic way, but there is no per-message "show original" or light toggle.
  - suite#1 is fixed for signed-in pages: the theme is rendered on the server in `frontend/index.html`. Before sign-in is out of scope.
- Frequency: daily for dark-mode users, low severity per message.
- Note: one comment on #57 suggests falling back to text/plain. That would be another heuristic on top of a remapping already chosen. What's missing is an escape hatch, not a better guess.

**I09 Emoji reactions from other clients arrive as near-empty replies, and you can't send one**
- [suite#920](https://github.com/frappe/suite/issues/920) Emoji reactions on messages (RFC 9078) (open)
- Still happens: **yes**. Nothing reads `Content-Disposition: reaction`. A prototype is stashed (memory: `feat/mail-reactions`).
- Frequency: weekly in threads with Gmail users.
- Note: the issue puts receiving first because it fixes threads that already look broken. That ordering is right. Related gap: G17.

**I10 You can't print a mail or save it as PDF to share**
- [suite#40](https://github.com/frappe/suite/issues/40) print view similar to other mail clients (open)
- [suite#862](https://github.com/frappe/suite/issues/862) Print thread/email (open)
- [mail#380](https://github.com/frappe/mail/issues/380) download email option in thread view (done as .eml)
- Still happens: **yes**. `MailActions.vue` has Download Email (.eml) and See MIME Message but no Print. The inventory lists print as absent.
- Frequency: weekly.
- Note: .eml solved a different problem (archiving), not sharing with someone who doesn't use mail. Related gap: G23.

**I11 Turning an email into a calendar event means retyping it**
- [suite#893](https://github.com/frappe/suite/issues/893) Create a calendar event from an email (open)
- [suite#53](https://github.com/frappe/suite/issues/53) UI: "Add to Calendar"
- [suite#488](https://github.com/frappe/suite/issues/488) Integrate calendar and mail (unlabelled; duplicate)
- Still happens: **partly**. Invitations get an RSVP banner (`CalendarInviteBanner.vue`), but `MailActions.vue` has no "Create event".
- Frequency: weekly.
- Note: related gap: G27.

### Compose

**I12 What you write isn't exactly what recipients receive**
- [suite#61](https://github.com/frappe/suite/issues/61) Email styles bleed into new mails while replying/forwarding (open)
- [suite#51](https://github.com/frappe/suite/issues/51) Images get saved as base64 if no prior changes have been made in the editor (open)
- [mail#349](https://github.com/frappe/mail/issues/349) Broken inline images (outgoing half)
- [mail#184](https://github.com/frappe/mail/issues/184) Unable to add an inline image
- [mail#291](https://github.com/frappe/mail/issues/291) Bullet list or Numbered list not working on Compose Mail
- [mail#298](https://github.com/frappe/mail/issues/298) Mail text formatting difference
- Still happens: **partly**.
  - The list (#291) and line-height (#298) problems are fixed.
  - #51 waits on frappe-ui PR #583.
  - #61 is unverified but likely: `QuotedContentExtension.renderHTML` sends the quoted mail verbatim and unsanitised, so a `<style>` in the quoted mail can still restyle the new text in the recipient's client.
- Frequency: weekly.
- Note: the root cause is that the HTML in the editor and the HTML that is sent go through different pipelines, and each issue fixed one difference. The decision should be about what the sent HTML is: inline images, quoted blocks scoped, styles inlined.

**I13 A draft can lose what you wrote**
- [suite#37](https://github.com/frappe/suite/issues/37) Offline support for drafts (open)
- [suite#38](https://github.com/frappe/suite/issues/38) [mobile] Mail disappears when resized between breakpoints
- [mail#289](https://github.com/frappe/mail/issues/289) [mobile] receivers' mails disappear in drafts
- [mail#290](https://github.com/frappe/mail/issues/290) [mobile] weird overlay behavior
- [mail#288](https://github.com/frappe/mail/issues/288) [mobile] confusing ux for drafts
- Still happens: **partly**.
  - #38, #289, #290 and #288 are fixed.
  - Nothing keeps a local copy: `useComposeMail.ts` and `useComposeWindow.ts` never use local storage. A failed save, or a drop in connection while typing, can still lose edits, and #37 says save errors repeat.
- Frequency: rare, but severe.
- Note: the issue proposes local storage. The user's problem is not knowing whether the draft is safe: a save state they can trust, plus recovery. Related gap: G24.

**I14 Only one draft can be open at a time**
- [suite#407](https://github.com/frappe/suite/issues/407) Minimise or pop out the composer to browse mail while drafting
- Still happens: **partly**. Minimise, dock and pop-out shipped, but there is still one composer at a time (inventory: known debt).
- Frequency: weekly.
- Note: see "Several composers at once" under "Better elsewhere" in the survey.

**I15 The From line is noise for most people and a guess for some**
- [suite#411](https://github.com/frappe/suite/issues/411) Hide the From selector when the user has exactly one address and identity (open)
- [suite#687](https://github.com/frappe/suite/issues/687) set the From with some smartness
- [mail#95](https://github.com/frappe/mail/issues/95) UI: Miscellaneous Enhancements (From defaults, sent-from address)
- [mail#457](https://github.com/frappe/mail/issues/457) Default reply button should be "Reply All"
- [mail#451](https://github.com/frappe/mail/issues/451) Show logged in user email address in Mail box
- Still happens: **partly**. #687 (choosing From smartly), #457 and #451 are fixed. The From row is always shown: the condition in `ComposeMailEditor.vue` (~line 57) never looks at how many identities there are.
- Frequency: daily, low severity.

**I16 Entering recipients (fixed)**
- [mail#351](https://github.com/frappe/mail/issues/351) 'To' field takes only the last email address
- [mail#463](https://github.com/frappe/mail/issues/463) Make email IDs movable across To, cc, Bcc
- [mail#468](https://github.com/frappe/mail/issues/468) quickly moving recipients between cc and to
- [suite#54](https://github.com/frappe/suite/issues/54) email Id drop down suggestion based on received emails and contact
- [suite#59](https://github.com/frappe/suite/issues/59) mention organization users inline
- [mail#381](https://github.com/frappe/mail/issues/381) auto create contacts
- Still happens: **no**. Chips drag between fields on desktop and use a menu on phone (`RecipientInput.vue`). Suggestions and @mentions are in. Copying an address out of a chip (a comment on mail#463) is unverified.
- Frequency: none.

**I17 Attachments: you can't attach from Drive, and some file types are refused**
- [suite#46](https://github.com/frappe/suite/issues/46) Attach files from Frappe Drive (open)
- [mail#426](https://github.com/frappe/mail/issues/426) increase supported file types for attachments (not planned)
- [suite#300](https://github.com/frappe/suite/issues/300) Unable to download attachment on Safari
- [mail#361](https://github.com/frappe/mail/issues/361) can't download/view attachment in PWA
- [mail#354](https://github.com/frappe/mail/issues/354) Allow multiple file selection for attachment at once
- [mail#355](https://github.com/frappe/mail/issues/355) Allow attachment drag and drop
- [mail#356](https://github.com/frappe/mail/issues/356) Retain filename when downloading
- [mail#379](https://github.com/frappe/mail/issues/379) allow file download from draft emails
- [mail#566](https://github.com/frappe/mail/issues/566) download attachment(s) as .zip
- [mail#285](https://github.com/frappe/mail/issues/285) View & Download attachment
- Still happens: **partly**.
  - Downloads, multi-select, drag-drop and filenames are fixed.
  - The composer has no Drive picker.
  - `upload_file` (`suite/mail/api/mail.py`) saves a Frappe File, so the site's allowed-extension list probably still blocks mail attachments (unverified).
- Frequency: weekly.
- Note:
  - mail#426 was answered with "change System Settings". That makes a mail decision depend on a site-wide file setting the user can't see. A refusal should say why.
  - G12 (attachments hub) is a different gap.

**I18 Signatures are hard to tell apart in settings**
- [suite#408](https://github.com/frappe/suite/issues/408) Tile view for signatures showing the rendered signature (open)
- [mail#533](https://github.com/frappe/mail/issues/533) Signature Settings
- [mail#286](https://github.com/frappe/mail/issues/286) feature request: mail signature
- [suite#541](https://github.com/frappe/suite/issues/541) Catch the failed signature delete (folded into #542)
- Still happens: **yes**. `SignatureSettings.vue` lists names only. A failed delete gives no message (#541, tracked on #542).
- Frequency: rare.

### Trust and safety

**I19 Deciding about a sender doesn't apply to their mail that's already in your mailbox**
- [suite#928](https://github.com/frappe/suite/issues/928) after marking a sender as trusted, ask whether to move their existing Junk mail (open)
- [mail#454](https://github.com/frappe/mail/issues/454) Design some better system against spam
- [mail#440](https://github.com/frappe/mail/issues/440) Email screening for cold emails
- [mail#452](https://github.com/frappe/mail/issues/452) Don't load images/external assets by default
- [mail#436](https://github.com/frappe/mail/issues/436) Email address blocking
- [suite#601](https://github.com/frappe/suite/issues/601) accept + archive and accept + delete from the screener
- [suite#147](https://github.com/frappe/suite/issues/147) domain as trusted sender
- [suite#137](https://github.com/frappe/suite/issues/137) improve screened senders
- [mail#420](https://github.com/frappe/mail/issues/420) UI: Sieve Manager/Editor (comment: block or trust a sender, not just a message)
- [mail#497](https://github.com/frappe/mail/issues/497) Junk modal should focus on the button, not X
- Still happens: **yes**.
  - `trustDomain` in `MailActions.vue` only writes a screening rule. Mail from that domain already in Junk stays there, including the message you acted from.
  - Blocking does the reverse: its toast offers to move the sender's Inbox mail.
  - "Mark as Not Junk" is only in menus.
  - Screening, blocking and remote-image blocking are in.
- Frequency: weekly.
- Note:
  - #928 proposes a modal for trust only. The same gap affects trusting a sender, trusting a domain, accepting from the screener and blocking. Each handles your existing mail differently.
  - The fix for the root cause is one rule: a sender decision offers, with Undo, to apply to that sender's existing mail.
  - The survey's "Better elsewhere: Screener" item covers HEY routing at screen-in time.

**I20 A mail sent to yourself doesn't arrive in your Inbox**
- [mail#425](https://github.com/frappe/mail/issues/425) Email addressed to myself doesn't appear in inbox or junk mail folder (not planned)
- Still happens: **unverified**. Stalwart drops it as a duplicate Message-ID. Suite also collapses duplicate copies in the thread (`collapse_duplicate_copies`).
- Frequency: rare.
- Note: people send mail to themselves to test, or as a note. Whatever the server does, the UI should not look like mail was lost.

### Search

**I21 Search doesn't find partial words, and active filters are easy to miss**
- [mail#480](https://github.com/frappe/mail/issues/480) Search does not work (not planned)
- [mail#279](https://github.com/frappe/mail/issues/279) Improved Search
- [suite#71](https://github.com/frappe/suite/issues/71) Search across accounts
- [suite#301](https://github.com/frappe/suite/issues/301) See unread messages only
- [mail#359](https://github.com/frappe/mail/issues/359) Show filter(s) being applied better
- Still happens: **partly**.
  - Search across accounts, the filter panel and the applied-filter count are in.
  - Stalwart matches whole tokens, so "use" doesn't find "user" (unverified today; local FTS from suite#180 covers cached contacts).
  - #301 was a user who couldn't find the existing Unread filter.
- Frequency: weekly.
- Note: see "Better elsewhere: search" in the survey, and G11.

### Notifications

**I22 Tapping a notification can open the wrong place, and the only switch is in Mail settings**
- [suite#39](https://github.com/frappe/suite/issues/39) [mobile][PWA] Tapping on email notifications opens up default browser instead of PWA (open)
- [suite#875](https://github.com/frappe/suite/issues/875) Push notifications: one device switch, per-app preferences, and a calendar entry point (open)
- [suite#44](https://github.com/frappe/suite/issues/44) Settings on Mobile
- [mail#422](https://github.com/frappe/mail/issues/422) UI: Mailbox Settings (per-folder push mute)
- [mail#439](https://github.com/frappe/mail/issues/439) Unread mail count on browser tab
- Still happens: **partly, unverified**.
  - `M/sw.ts` sends notification clicks to `openNotificationTarget`. Whether this opens the installed PWA on iOS and Android today was not tested.
  - Per #875, the device switch still lives only in Mail's settings.
- Frequency: daily for phone users if #39 still happens.
- Note: related gaps: G22 and G29.

### Mobile and layout

**I23 On phones, fixed bars and the visible screen disagree, so content gets clipped or stacked**
- [suite#413](https://github.com/frappe/suite/issues/413) Mobile selection action bar and tab bar render stacked ("double nav") (open)
- [mail#446](https://github.com/frappe/mail/issues/446) Focus and scrolling issues while composing / replying in PWA
- [mail#290](https://github.com/frappe/mail/issues/290) [mobile] weird overlay behavior
- Still happens: **unverified** for #413 (iOS only, no repro). The others are fixed.
- Frequency: rare.
- Note: #413 already names the root cause: `fixed` bars measured against the viewport, inside an `h-dvh` layout. Keeping the selection bar in the layout's flow removes the whole class of bug. Mobile compose is already a route for the same reason.

**I24 You can't size the reading pane**
- [suite#47](https://github.com/frappe/suite/issues/47) Allow resizing reading pane (open)
- [suite#412](https://github.com/frappe/suite/issues/412) All accounts should support the split view
- [mail#243](https://github.com/frappe/mail/issues/243) Store current view locally
- [mail#470](https://github.com/frappe/mail/issues/470) Remove date separation other than Today
- Still happens: **partly**. All accounts has the split view and date grouping is a setting, but no Mail component has a resize handle.
- Frequency: daily, low severity.

### Fixed (kept so they aren't reported again)

**I25 Moving through mail by keyboard**
- Issues: [mail#272](https://github.com/frappe/mail/issues/272) Move between emails with arrow keys, [mail#273](https://github.com/frappe/mail/issues/273) Arrow buttons for quicker navigation, [mail#303](https://github.com/frappe/mail/issues/303) Basic keyboard shortcuts, [mail#326](https://github.com/frappe/mail/issues/326) Threads should be hyperlinks.
- Still happens: **no**.
- Note: discovering the shortcuts is still open; see "Better elsewhere: command palette" in the survey.

**I26 No feedback or undo after actions**
- Issues: [mail#314](https://github.com/frappe/mail/issues/314) Loading, Success, and Error indicators for thread actions, [mail#308](https://github.com/frappe/mail/issues/308) Undo for mail actions, [suite#72](https://github.com/frappe/suite/issues/72) Optimistic actions, [suite#478](https://github.com/frappe/suite/issues/478) Undo after sending an email, [suite#67](https://github.com/frappe/suite/issues/67) Add action to see mail after sending, [mail#245](https://github.com/frappe/mail/issues/245) Quick delete option, [mail#337](https://github.com/frappe/mail/issues/337) Add option to star emails on Email List view, [mail#450](https://github.com/frappe/mail/issues/450) Remove animations!
- Still happens: **no**.

**I27 Focus lands in the wrong field**
- Issues: [mail#247](https://github.com/frappe/mail/issues/247) Forwarding doesn't focus in sent, [mail#449](https://github.com/frappe/mail/issues/449) Reply editor not getting focus, [suite#60](https://github.com/frappe/suite/issues/60) Subject input not working, [mail#84](https://github.com/frappe/mail/issues/84) UI: displays quoted content on reply, [mail#459](https://github.com/frappe/mail/issues/459) Scroll to the last reply in a thread, [mail#462](https://github.com/frappe/mail/issues/462) Threads should have new reply on top.
- Still happens: **no**.
- Note: mail#462 asked for the newest reply on top. It was answered with Gmail-style folding instead, keeping chronological order.

**I28 The app fails to load with a white screen or CSRF error**
- Issues: [suite#43](https://github.com/frappe/suite/issues/43) Error page for when mail server is down, [suite#49](https://github.com/frappe/suite/issues/49) CSRF token error, [mail#220](https://github.com/frappe/mail/issues/220) Issues encountered while using Frappe Mail.
- Still happens: **no**. `MailServerUnavailableView.vue` exists, and the CSRF error couldn't be reproduced after the move to Suite.

**I29 Small visual glitches**
- Issues: [suite#201](https://github.com/frappe/suite/issues/201) Folder actions menu not visible, [suite#62](https://github.com/frappe/suite/issues/62) Style issues, [mail#238](https://github.com/frappe/mail/issues/238) UI issues, [mail#239](https://github.com/frappe/mail/issues/239) Take first letter for avatar, [mail#466](https://github.com/frappe/mail/issues/466) UI: save draft, [mail#464](https://github.com/frappe/mail/issues/464) Mark as Read for a folder not applied.
- Still happens: **no**.

## Not kept

- **Feature asks already covered by the survey, with no separate user problem**: [suite#45](https://github.com/frappe/suite/issues/45) Mail Group (G18), [suite#50](https://github.com/frappe/suite/issues/50) "Filter messages like this" (shipped as "Filter messages from this sender"; G10), [suite#70](https://github.com/frappe/suite/issues/70) All Inbox (shipped).
- **Native app**: suite#63–66 and mail#484–490 are about the NativeScript app, not mobile web. Their asks (attachments, contacts, settings, push on phone) are covered by I17, I22 and the phone Profile tab.

## Top 12 problems

Ranked by frequency × severity. Severity weights lost or misplaced mail, and anything that misleads the user, above inconvenience.

| Rank | Group | Problem | Issues | Still happens | Frequency |
|---|---|---|---|---|---|
| 1 | I02 | A list row's date, star, preview and sender come from different messages, so the row doesn't describe its thread | 8 | partly | daily |
| 2 | I19 | Deciding about a sender doesn't apply to their mail already in your mailbox | 10 | yes | weekly |
| 3 | I01 | New mail and changes made elsewhere reach the list late, or only after a refresh | 5 | partly | daily |
| 4 | I12 | What you write isn't exactly what recipients receive | 6 | partly | weekly |
| 5 | I13 | A draft can lose what you wrote | 5 | partly | rare, severe |
| 6 | I08 | In dark mode some mail is unreadable, with no way to see it as sent | 5 | partly | daily (dark users) |
| 7 | I04 | Bursts of similar automated mail fill the list | 2 | yes | daily |
| 8 | I03 | Selecting many threads (Shift+arrows, select all) doesn't behave as expected | 4 | yes | weekly |
| 9 | I07 | Some third-party mail renders differently from other clients | 6 | partly | weekly |
| 10 | I17 | Can't attach from Drive, and some file types are refused without saying why | 10 | partly | weekly |
| 11 | I22 | Tapping a notification can open the wrong place, and the only switch is in Mail settings | 5 | partly, unverified | daily (phone) |
| 12 | I10 | You can't print a mail or save it as PDF | 3 | yes | weekly |

Next in line: I05 (a thread spread across folders), I06 (folders can't be nested), I11 (email to calendar event), I15 (From line), I21 (search misses partial words), I24 (pane width), I09 (reactions).
