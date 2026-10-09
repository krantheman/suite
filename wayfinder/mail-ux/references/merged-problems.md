# Merged problems

Decided in [The user's pain list](../tickets/003-pain-list.md) on 2026-10-09:
the decisions became tickets or inputs to tickets, in the order recorded in
[MAP.md](../MAP.md); the obvious fixes are in [fixes.md](../fixes.md). The
ranking at the end of this file was the proposal; the map holds the agreed
order.

Every finding from the four sources, merged by underlying problem. Sources:
[heuristic-audit.md](heuristic-audit.md) (A01–A95),
[github-issues.md](github-issues.md) (I01–I29),
[feature-gap-survey.md](feature-gap-survey.md) (G01–G29),
[sent-unread.md](sent-unread.md), [attachment-search.md](attachment-search.md),
and the user's pains in tickets 006–015.

How to read a cluster:

- **Type**: *decision* (a real choice: model, behaviour, trade-off) or *obvious fix* (the right answer isn't in doubt).
- **Ticket**: an existing ticket it fits, or *new*.
- **Group**: 1 daily friction (list, thread), 2 trust and safety, 3 compose and search, 4 new features, 5 settings and polish.
- **Freq / sev**: frequency (daily, weekly, rare) and worst severity (1 cosmetic to 4 blocks). A-ids carry the audit's grades. I-ids have no graded severity in the source, so I-only grades are estimates (*est.*). G-ids are gaps: they show the survey's value instead of a severity.
- **User pain**: the cluster holds an item from the user's own list (ticket 003).

Counts: 50 clusters: 33 decisions, 17 obvious fixes. Every A-, I- and G-id appears exactly once, in a cluster or in one of the two side lists at the end.

---

## Group 1: daily friction (the list, the thread)

**C01. The Inbox is buried under bulk mail** (user pain, marked important)
- Newsletters, notifications, receipts, bursts of alerts and reply-all storms sit among the mail that matters, and there's no cheap way out of a list.
- Ids: I04, G05, G06, G07, G08, A30
- decision · 010 · daily · sev 3 (est., I04)

**C02. Clearing the Inbox takes too many steps** (user pain, via 010)
- Archive and Trash sit in "…" in the thread and the desktop bulk bar. Hover icons are tiny and put Trash next to Archive. Phones have no swipe on rows and no visible way into selection.
- Ids: A07, A13, A20, A90, G21
- decision · 010 (the "can't be cleared quickly" part; overlaps 012) · daily · sev 3

**C03. Sorting mail automatically means writing Sieve** (user pain, via 010)
- The only general filter tool is raw Sieve, so most people can't tell Mail where a kind of mail should go.
- Ids: G10, A75
- decision · 010 (rules piece) · weekly · sev 2; value High

**C04. The screen doesn't use its space well** (user pain)
- Split-view rows are tall (about 7 fit), always-on checkboxes and day headers eat the column, the reading pane can't be sized, phone and desktop lists differ, and the phone nav spends its space on seven apps.
- Ids: A04, A05, A06, A86, A89, I24
- decision · 012 · daily · sev 2

**C05. Unread counts that mean nothing** (user pain)
- Sent, Junk and Trash show counts (and echo them in the tab title), because your own mail can be made unread. Inbox shows an unread count on desktop and an unlabelled total on phone.
- Ids: A10, A11 (+ sent-unread.md)
- decision · 015 (A10 widens it to Junk and Trash) · daily · sev 2

**C06. Forwards leave the conversation** (user pain)
- A forward starts a new thread by default, which splits the conversation. The setting that fixes it is off and buried.
- Ids: none (user pain only)
- decision · 006 · weekly · sev 3 (est.)

**C07. Reply goes to everyone by reflex, and replying means scrolling**
- The only quick-reply icon is Reply All, even on group aliases. On desktop the Reply, Reply All and Forward buttons only sit after the last message.
- Ids: A21, A22
- decision · new · daily · sev 3

**C08. A row doesn't describe its thread**
- The date, star, preview and sender in a row come from different messages. The row star, the header star and Starred membership use three rules. A Sent row doesn't show which message you clicked.
- Ids: I02
- decision (which message represents a thread in each view) · new · daily · sev 3 (est.)

**C09. Skimming clears unread by accident**
- Opening a thread or passing it with j/k marks it read at once, with no delay and no setting. Search does the same through 008.
- Ids: A14
- decision · new · daily · sev 2

**C10. Thread menus overlap, and mix routine, risky and technical items**
- Thread and message menus repeat Junk, Trash, Unread and the star without saying which scope they act on. The message menu is a flat 13-item list holding Block, Trust domain, See MIME and View in Desk.
- Ids: A24, A25, A33
- decision · 012 (what is one click away, what is hidden) · weekly · sev 2

**C11. Folders behave like labels, but the UI says folders**
- A thread can sit in several folders. Move To and Add To look alike. Moving, replying and marking unread act unexpectedly across folders. Folders can't nest, Archive hides under More, and the groups are called "Default" and "Custom".
- Ids: A23, A55, A58, I05, I06, G09
- decision · 004 · weekly · sev 2

**C12. All accounts is a lesser copy of a single account's list**
- All accounts has no checkboxes or select-all, no unknown-sender marker, no subject in the tab title, and no Outbox or New Folder.
- Ids: A02, A03, A32, A56
- obvious fix (one shared list; the user confirmed A02) · new · daily · sev 3

**C13. Some mail doesn't look as the sender sent it**
- Wide HTML is clipped on desktop and needs panning on phone. Some third-party HTML (tables) renders wrong. Dark mode makes some mail unreadable, with no way to show the original.
- Ids: A27, I07, I08
- obvious fix (fit to width, a regression set of real messages, a "show original" escape hatch) · new · daily · sev 3

**C14. The list lags behind the server**
- New mail and changes made elsewhere take up to 30 s (the poll) when push doesn't arrive. Draft edits don't reach the list until the editor closes.
- Ids: I01
- obvious fix (the list tracks server changes) · new · daily · sev 3 (est.)

**C15. Selecting many threads and keyboard focus misbehave**
- Shift+arrow drops two rows when you change direction (no anchor). One click selects a whole day without the toolbar showing it. Esc closes the thread before clearing the selection. The first key after the shortcuts modal is lost.
- Ids: I03, A12, A83, A84
- obvious fix · new · weekly (daily for keyboard users) · sev 2

**C16. Controls can't be named or hit**
- 32 icon buttons on one screen have no accessible names, the compose header icons included. Phone touch targets are 16–28 px.
- Ids: A08, A39, A87
- obvious fix · new · daily · sev 2

**C17. Fixed elements cover content on phones**
- Toasts sit over the bottom nav, the compose button covers a row, and the selection bar can stack on the tab bar (iOS, unverified).
- Ids: A62, A88, I23
- obvious fix (keep bars in the layout's flow) · new · daily · sev 2

**C18. Small list glitches**
- Attachment chips cut names to 3–4 letters. The open-row accent outlives the pane. The title link goes to a broken URL. Trash loads behind a bare spinner. Draft rows wear a red badge.
- Ids: A15, A16, A17, A19, A48
- obvious fix · new · daily · sev 1

## Group 2: trust and safety

**C19. Unknown senders: what screening is, and what its buttons do** (user pain)
- The marker is a faint icon that only explains itself on hover. No silently junks the whole thread, Yes silently lets images in for good, and three vocabularies (and two settings tabs) describe one flow. Images can only be shown once.
- Ids: A31, A34, A35, A36, A37
- decision · 013 · daily · sev 3

**C20. A decision about a sender doesn't reach mail you already have** (user pain, via 013)
- Trust, trust domain, accept and block each treat a sender's existing mail differently. Trusting a domain gives no sense of how much it lets in.
- Ids: I19, A26
- decision · 013 · weekly · sev 3

**C21. You can't tell which account a mail belongs to or goes out from**
- All accounts marks only non-default rows. An open thread doesn't show the receiving account. From is a grey chip when you have several accounts, yet always shown when you have one. Settings name no account, and the switcher shows no counts.
- Ids: A01, A29, A43, A57, A69, I15
- decision · new · daily · sev 3

**C22. You can't trust that a draft is safe**
- A failed save or a dropped connection can lose edits, and nothing says whether the draft is saved or offers recovery.
- Ids: I13
- decision (save state and recovery; local copy or not) · new · rare · sev 4 (est.)

**C23. Outbox doesn't say what happened to your mail**
- "Final" in the list and "Sent" in the detail. "Submissions" and SMTP codes carry equal weight. "Remove" is ambiguous, and nothing says how long Outbox keeps items.
- Ids: A64, A65, A66, A67, A68
- decision (what Outbox is for the user) · new · weekly · sev 2

**C24. Destructive actions don't say what they destroy**
- Delete Now gives no count and doesn't say it's permanent. Discard sits beside Send. "Delete after sending" toggles sit among routine ones. Log out sits right under Settings.
- Ids: A18, A44, A70, A92
- obvious fix · new · weekly · sev 3

**C25. Easy to pick the wrong recipient**
- Suggestions show the name large and the address small. The same person at two domains looks identical, and the list covers Subject.
- Ids: A42
- obvious fix · new · daily · sev 3

**C26. Toasts and Undo arrive after you've moved on**
- The list changes at once, but the "done / Undo" toast waits for the server.
- Ids: A63
- obvious fix · new · daily · sev 2

## Group 3: compose and search

**C27. Finding a specific mail** (user pain, marked important)
- Search doesn't show its scope (other accounts are missed silently), doesn't show why a result matched (no snippets), misses partial words, PDFs and Office files, and filenames, can't refine on the results page, and can't save a search or browse files.
- Ids: A49, A50, A52, A53, A54, I21, G11, G12 (+ attachment-search.md, ticket 009)
- decision · 011 · weekly · sev 2

**C28. Search opens a result you didn't pick** (user pain)
- Running a search opens the first thread, hides the results and marks that thread read. "See all results" sits last, and Enter opens the first thread.
- Ids: A51
- decision · 008 · weekly · sev 2

**C29. Compose covers the mail you're answering**
- The desktop composer is a modal over everything, docking is hidden, and only one draft can be open at a time.
- Ids: A38, I14
- decision · new (sits inside 012's compose region) · daily · sev 2

**C30. You can't tell which signature will be added**
- Identity has a Default Signature while Signatures says "none". A new message shows no signature, and the list shows names only.
- Ids: A46, A72, I18
- decision (one home for signatures) · new · daily · sev 2

**C31. Compose hides or drops its own controls**
- Cc and Bcc hide behind a bare chevron. Schedule send is hidden. On phones, Attach only appears once you type. One click collapsed the composer, and the next click landed on the list.
- Ids: A40, A41, A45, A47
- obvious fix · new · weekly · sev 3

**C32. What you write isn't what recipients get**
- Quoted styles bleed into the new text, and images go out as base64. The editor and the sent HTML go through different pipelines.
- Ids: I12
- obvious fix · new · weekly · sev 3 (est.)

**C33. Attaching from Drive isn't possible, and refusals don't say why**
- There's no Drive picker, and a site-wide file-type list silently blocks mail attachments.
- Ids: I17
- obvious fix · new · weekly · sev 2 (est.)

## Group 4: new features

**C34. Mail you can't act on yet gets lost**
- No snooze, no "remind me if no reply", no reply-later queue, no pin to top.
- Ids: G01, G02, G03, G04
- decision · new (related to 010) · daily · value High (shared scheduler)

**C35. The same replies are typed again and again**
- No templates or snippets, personal or team-shared.
- Ids: G14
- decision · new · daily · value High

**C36. Team addresses can't be shared or delegated**
- No shared inbox (support@), no delegation or send-as, no assignment.
- Ids: G18
- decision · new · daily · value High (backend work)

**C37. Notifications don't reflect the mail you care about**
- No VIP, per-sender or per-thread rules, no quiet hours. The rail dot disagrees with an always-empty Notifications panel. The push switch lives only in Mail settings, and a tap may open the browser (unverified).
- Ids: G22, G29, A59, A61, I22
- decision · new · daily · value Med-High

**C38. Discussing a mail with colleagues means forwarding it**
- No private team comments, thread sharing or shared drafts.
- Ids: G19
- decision · new · weekly · value Med-High

**C39. AI and translation need an outside service**
- Summaries, suggested replies and translation all need a model or API off the mail server. That's a policy decision first.
- Ids: G25, G26
- decision · new · weekly · value Med-High

**C40. No context on who you're writing to**
- No sender pane with contact details and recent mail with the person.
- Ids: G13
- decision · new · weekly · value Medium

**C41. Mail is unusable offline**
- Nothing is cached for reading, and nothing is queued for sending.
- Ids: G24
- decision · new · rare · value Medium (large project)

**C42. You can't ask for a read receipt**
- Suite reads returned receipts but can't request one.
- Ids: G15
- decision · new · rare · value Low-Med

**C43. Nowhere to keep private notes on a thread**
- Ids: G20
- decision · new · rare · value Low-Med

**C44. Reactions arrive as near-empty replies, and you can't send one**
- Ids: I09, G17
- obvious fix (RFC 9078; a prototype is stashed on `feat/mail-reactions`) · new · weekly · value Medium

**C45. You can't print a mail or save it as PDF**
- Ids: I10, G23
- obvious fix (print view) · new · weekly · value Medium

**C46. Turning a mail into an event means retyping it**
- Ids: I11
- obvious fix ("Create event" prefilled from the mail) · new · weekly · sev 2 (est.)

## Group 5: settings and polish

**C47. The app's words don't agree**
- Mail, Mails, Email, message and thread are used for the same thing. Casing is mixed (Title Case and sentence case), and so is spelling (British and US). Labels read "All Mails" against "All", and "Clear All Mails" sounds destructive. The list and the thread use different time formats.
- Ids: A09, A28, A80, A93, A94, A95
- decision (glossary in CONTEXT.md, a casing and spelling rule) · new · daily · sev 2

**C48. Shortcuts clash with convention and are hard to learn**
- ⌘Z does three jobs and ⌘D takes the browser's bookmark key. Star and Move have no shortcuts, the G-mappings differ from Gmail, and hints show only in some menus. The palette only searches.
- Ids: A81, A82, A85
- decision · new · weekly · sev 2

**C49. Mail settings are hard to find and sorted by implementation**
- Settings open on Profile, and Mail has 14 tabs. Admin-level Credentials and Advanced sit among everyday settings. One tab holds a single setting. The phone has two settings homes, and storage is only visible once it's critical.
- Ids: A60, A71, A77, A78, A91
- decision · new · weekly · sev 1

**C50. Settings screens show raw or stale data**
- An internal id in the Identity picker, last year's vacation defaults, push devices as bare UUIDs, and an overflowing Screener table.
- Ids: A73, A74, A76, A79
- obvious fix · new · rare · sev 2

---

## Already fixed / not reproducible

- **I16** Entering recipients: fixed (the source marks it "no").
- **I25** Keyboard navigation: fixed. Discoverability lives on in C48.
- **I26** Feedback and Undo after actions: fixed. Late toasts are C26.
- **I27** Focus in the wrong field: fixed.
- **I28** White screen or CSRF on load: fixed.
- **I29** Small visual glitches: fixed.
- **I20** Mail to yourself doesn't arrive: probably not reproducible. sent-unread.md found the delivered copy reaches the Inbox as a separate unseen email (`mailCopies.ts`), against the issue's "Stalwart drops it". Verify once before closing.

## Recommend out of scope

- **G16** Pixel open tracking: privacy-hostile, undermined by Apple MPP, and needs a public endpoint. The survey recommends against it.
- **G27** Calendar alongside mail: Calendar gets its own map, and RSVP in the thread exists. Creating an event from a mail stays in as C46.
- **G28** Merge threads, rename subjects, reply to many: low value, and rename and merge need a Suite overlay over threads the server computes.

---

## Ranked decisions (proposed)

The two marked pains lead (010, 011). After them, by group, with the user's pains first within each group, then frequency × severity (daily 3, weekly 2, rare 1). Group 4 is ranked by the survey's value × feasibility.

1. C01 The Inbox is buried under bulk mail (010)
2. C02 Clearing the Inbox takes too many steps (010)
3. C27 Finding a specific mail (011)
4. C03 Sorting mail automatically means writing Sieve (010)
5. C04 The screen doesn't use its space well (012)
6. C05 Unread counts that mean nothing (015)
7. C06 Forwards leave the conversation (006)
8. C07 Reply goes to everyone by reflex (new)
9. C08 A row doesn't describe its thread (new)
10. C09 Skimming clears unread by accident (new)
11. C10 Thread menus overlap and mix risky items (012)
12. C11 Folders behave like labels (004)
13. C19 Unknown senders: what screening is (013)
14. C20 A sender decision doesn't reach existing mail (013)
15. C21 Which account a mail belongs to or goes out from (new)
16. C22 You can't trust that a draft is safe (new)
17. C23 Outbox doesn't say what happened (new)
18. C28 Search opens a result you didn't pick (008)
19. C29 Compose covers the mail you're answering (new)
20. C30 Which signature will be added (new)
21. C35 Templates (new)
22. C34 Snooze, follow-up, reply later, pin (new)
23. C36 Shared inboxes and delegation (new)
24. C37 Notifications that reflect what you care about (new)
25. C38 Team comments and thread sharing (new)
26. C39 AI and translation policy (new)
27. C40 Sender context pane (new)
28. C41 Offline (new)
29. C42 Requesting read receipts (new)
30. C43 Private notes on threads (new)
31. C47 The app's words don't agree (new)
32. C48 Shortcuts clash and are hard to learn (new)
33. C49 Mail settings organisation (new)

## Obvious fixes, by group

- **Group 1:**
  - C12 All accounts parity
  - C13 Mail renders as sent
  - C14 The list lags behind the server
  - C15 Selection and keyboard focus
  - C16 Accessible names and touch targets
  - C17 Phone overlays
  - C18 Small list glitches
- **Group 2:**
  - C25 Wrong recipient
  - C24 Destructive actions say what they destroy
  - C26 Toasts and Undo arrive late
- **Group 3:**
  - C31 Compose controls hidden or dropped
  - C32 Sent HTML matches what you wrote
  - C33 Drive attachments and refusals
- **Group 4:**
  - C44 Reactions
  - C45 Print
  - C46 Mail to event
- **Group 5:**
  - C50 Settings show raw or stale data
