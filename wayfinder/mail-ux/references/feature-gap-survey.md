# Feature gap survey: Suite Mail vs Gmail, Superhuman, HEY, Fastmail, Apple Mail, Spark

Date: 2026-10-09. Answers [ticket 002](../tickets/002-feature-gap-survey.md).

## Method

- What Suite has comes from [inventory.md](inventory.md), checked against the code where it was unclear: list rows have no swipe actions (`utils/swipeGesture.ts` only pages between open threads), search keeps 5 recent searches in localStorage and has no saved searches (`useMailCommandPaletteSearch.ts`), the command palette only searches, read receipts are only read back from `EmailSubmission.mdnBlobIds` (`suite/mail/api/scheduled.py`), and List-Unsubscribe is read only to classify mail (`suite/mail/classification/headers.py`).
- Competitor claims come from each vendor's own help centre or feature pages: support.google.com, help.superhuman.com, hey.com/features, fastmail.help and fastmail.com, support.apple.com, sparkmailapp.com. help.superhuman.com refuses automated fetches (HTTP 403), so its claims come from search-engine extracts of those articles; the links point at the articles.
- Feasibility comes from the RFCs and IETF drafts (rfc-editor.org, datatracker.ietf.org) and Stalwart's docs (stalw.art). Stalwart's [RFC list](https://stalw.art/docs/development/rfcs/) covers RFC 8620/8621, 8887, 9404, 9425, 9661 (Sieve), 9610 (Contacts), 9670 (Sharing), 9749 (Web Push), the JMAP calendars and filenode drafts, and RFC 4865 FUTURERELEASE. It does not list RFC 9007 (JMAP MDN) or the email-snooze draft. Its Sieve interpreter supports about 27 RFC extensions plus `vnd.stalwart.expressions`, `vnd.stalwart.while` and an `llm_prompt` function ([Sieve overview](https://stalw.art/docs/sieve/), [LLM integration](https://stalw.art/docs/sieve/llm/)), but no `snooze`.
- Feasibility labels:
  - **Supported**: Stalwart or JMAP already carries it, so it is frontend work, sometimes with a thin Suite API.
  - **Backend work**: needs Suite (Frappe) server work on top of Stalwart, such as a scheduler, a delivery hook, stored records, or Stalwart principal/ACL setup.
  - **Outside service**: needs something beyond the mail server and Suite, such as an LLM or a translation API. These are flagged, not ruled out.
- Value is for people at a company using Suite as work mail (the [map's](../MAP.md) Notes), keyboard users included.

## Gaps

### Triage and time

**G01 Snooze**
- Who has it:
  - Gmail: a Snooze button on row hover, pick a date and time; a "Snoozed" folder and `in:snoozed`.
  - Fastmail: Later today / Tomorrow / Next week or an exact time, up to 512 days out; rules can snooze too.
  - Spark: snoozed mail comes back as "new".
  - Apple Mail: "Remind Me", from a swipe or right-click, with 1 hour / Tonight / Later presets; the message returns to the top.
  - HEY: "Bubble Up", which resurfaces a thread after a delay.
- Feasibility: **Backend work.** Stalwart has no snooze support, and [draft-ietf-extra-email-snooze](https://datatracker.ietf.org/doc/draft-ietf-extra-email-snooze/) (a JMAP `snoozed` property with `until`/`moveToMailboxId`, the IMAP `SNOOZE` command and the Sieve `snooze` action) is expired and parked. Suite can still build it with a mailbox that carries the `Snoozed` attribute from [RFC 9979](https://www.rfc-editor.org/rfc/rfc9979.html), plus a Frappe scheduled job that moves mail back and marks it new (`$new`, also RFC 9979).
- Value: **High.** Work mail keeps arriving before you can act on it, and every competitor has snooze.
- Sources: [Gmail](https://support.google.com/mail/answer/7622010), [Fastmail](https://fastmail.com/help/receive/snooze.html), [Spark](https://sparkmailapp.com/help/manage-your-inbox/set-aside-vs-pin-vs-snooze), [Apple](https://support.apple.com/guide/mail/mark-emails-to-revisit-later-mlhlp1052/mac), [HEY](https://www.hey.com/features/bubble-up/)

**G02 Follow-up reminders and nudges**
- Who has it:
  - Superhuman: "Remind Me" defaults to "if no reply", so the thread returns only if nobody answered, and the reminder cancels itself when someone does. It can also be set from the composer.
  - Spark: follow-up reminders on sent mail, up to 2 months ahead, with a Reminders folder.
  - Apple Mail: "Follow Up Suggestions" resurface a sent message after 3 days without a reply.
  - Gmail: "Nudges" suggest mail to reply to and to follow up on, using ML.
- Feasibility: **Backend work.** Suite needs the same scheduler as G01, plus a check for a newer message in the thread from someone else (`Email/query` by thread). The rule-based version needs no ML.
- Value: **High.** Unanswered requests to clients and colleagues are a classic work-mail failure.
- Sources: [Superhuman](https://help.superhuman.com/hc/en-us/articles/46005666142733-Remind-Me), [Spark](https://sparkmailapp.com/help/sending-emails/set-follow-up-reminders), [Apple](https://support.apple.com/guide/mail/reply-to-forward-or-follow-up-on-emails-mlhlp1010/mac), [Gmail](https://support.google.com/mail/answer/6585)

**G03 Set aside / Reply later queues**
- Who has it:
  - HEY: "Reply Later" piles threads up, and "Focus & Reply" walks through them in sequence. "Set Aside" keeps reference mail handy.
  - Spark: Set Aside puts mail in a bubble at the bottom left.
- Feasibility: **Supported.** A keyword or mailbox, a view, and a sequential reply mode on top.
- Value: **Medium.** Overlaps with star, snooze and pin, so it's worth doing only if the model stays simple.
- Sources: [HEY Reply Later](https://www.hey.com/features/reply-later/), [HEY Focus & Reply](https://www.hey.com/features/reply-mode/), [HEY Set Aside](https://www.hey.com/features/set-aside/), [Spark](https://sparkmailapp.com/help/manage-your-inbox/set-aside-vs-pin-vs-snooze)

**G04 Pin to top / mark important**
- Who has it:
  - Fastmail: Pin from hover, right-click or toolbar, with a sort option to keep pinned mail at the top. It shows as "Starred" in other clients.
  - Spark: Pins go to a sidebar section or the top of the Inbox.
  - Gmail: Important markers and an "Important first" inbox type.
- Feasibility: **Supported.** Stalwart already has `$flagged`; this is only a sort or section in the list.
- Value: **Low-Med.** Suite's star covers most of it. The new part is the "keep at top" view option.
- Sources: [Fastmail](https://www.fastmail.help/hc/en-us/articles/1500000280341-Pin-important-messages), [Spark](https://sparkmailapp.com/help/manage-your-inbox/set-aside-vs-pin-vs-snooze), [Gmail](https://support.google.com/mail/answer/3094499)

**G05 Mute thread**
- Who has it:
  - Gmail: More > Mute (shortcut M); later replies skip the inbox, and `is:muted` finds them.
  - Apple Mail: Mute from the Reply menu silences notifications for the thread.
  - HEY and Spark: Mute Thread.
- Feasibility: **Backend work.** RFC 9979 registers `$muted` ("uninterested in future replies"). Keeping new replies out of the inbox needs a delivery-time hook. That could be Sieve over a list of muted Message-IDs (`extlists`, RFC 6134, is supported), or Suite's webhook/import path moving new thread members.
- Value: **Med-High.** Reply-all storms and CC'd threads are common at work.
- Sources: [Gmail](https://support.google.com/mail/answer/6576), [Apple](https://support.apple.com/guide/iphone/set-email-notifications-iphc13a970c8/ios), [HEY](https://www.hey.com/features/mute-thread/), [Spark](https://sparkmailapp.com/features), [RFC 9979](https://www.rfc-editor.org/rfc/rfc9979.html)

### Noise and sorting

**G06 Unsubscribe (and a subscriptions manager)**
- Who has it:
  - Gmail: an Unsubscribe link by the sender, plus "Manage subscriptions" under More, which lists senders by recent volume with one-click Unsubscribe.
  - Apple Mail: a mailing-list banner with an unsubscribe link.
  - Fastmail: Unsubscribe next to the sender, shown only on legitimate list mail.
- Feasibility: **Supported, plus a thin Suite API.** JMAP exposes `header:List-Unsubscribe` and `header:List-Unsubscribe-Post`. The one-click POST from [RFC 8058](https://www.rfc-editor.org/rfc/rfc8058.html) should go from Suite's server rather than the browser, to avoid CORS and the user's IP. The `mailto:` variant is an ordinary submission. RFC 9979 has `$canunsubscribe` and `$unsubscribed` to remember state.
- Value: **High.** It cuts noise cheaply, and Suite already parses these headers for classification.
- Sources: [Gmail unsubscribe](https://support.google.com/mail/answer/15433283), [Gmail subscriptions](https://support.google.com/mail/answer/15621070), [Apple](https://support.apple.com/guide/mail/mlhld3405766/mac), [Fastmail](https://www.fastmail.help/hc/en-us/articles/6905792637967-Unsubscribe)

**G07 Categories, tabs, bundles (Imbox / Feed / Paper Trail)**
- Who has it:
  - Gmail: Primary / Social / Promotions / Updates / Forums tabs; drag between tabs to teach it.
  - Apple Mail: Primary / Transactions / Updates / Promotions. Time-sensitive mail also shows in Primary, non-Primary categories open as a per-sender digest, and "Categorize Sender" corrects it.
  - HEY: Imbox, Feed (newsletters shown open, newest first), Paper Trail (receipts), and Bundles that collapse one sender into a row.
  - Spark: Smart Inbox and "Newsletters & Notifications" bundles.
  - Superhuman: Auto Labels (marketing, pitch, social) move mail from Important to Other, with optional auto-archive.
- Feasibility: **Supported.** Suite already classifies on the backend (`suite/mail/classification/`); only the UI is missing.
- Value: **High.** Category noise is the biggest inbox-clarity win, and the backend is built. How it relates to the screener and folders is open on the map.
- Sources: [Gmail](https://support.google.com/mail/answer/3094499), [Apple](https://support.apple.com/guide/iphone/use-categories-iphfe4a36baf/ios), [HEY Imbox](https://www.hey.com/features/the-imbox/), [HEY Feed](https://www.hey.com/features/the-feed/), [HEY Paper Trail](https://www.hey.com/features/paper-trail/), [HEY Bundles](https://www.hey.com/features/bundles/), [Spark](https://sparkmailapp.com/features/smart_inbox), [Superhuman](https://new.superhuman.com/auto-labels-custom-auto-labels-313354)

**G08 Custom split inboxes**
- Who has it:
  - Superhuman: Split Inbox sections at the top of the inbox, built from search criteria or Auto Labels (they advise no more than 7), with a library of presets.
  - Gmail: the "Multiple inboxes" inbox type.
- Feasibility: **Supported.** Each split is an `Email/query` filter.
- Value: **Medium.** Power users like it; it can come after categories ship.
- Sources: [Superhuman](https://help.superhuman.com/hc/en-us/articles/46005636204941-Custom-Split-Inbox), [Gmail](https://support.google.com/mail/answer/3094499)

**G09 Labels UI**
- Who has it:
  - Gmail: labels throughout.
  - Fastmail: a "Folders or Labels" setting under Mail organization, where labels allow several per message.
- Feasibility: **Supported.** JMAP `mailboxIds` is already many-to-many, and Suite's inventory says a thread can sit in several folders.
- Value: **Medium.** Many staff come from Gmail; folders already cover most needs.
- Sources: [Fastmail labels](https://www.fastmail.help/hc/en-us/articles/360058753554-Setting-up-and-using-labels), [Gmail labels](https://support.google.com/mail/answer/118708)

**G10 Visual rules/filters builder**
- Who has it:
  - Gmail: "Create filter" from the search options, and "Filter messages like these" from a selected message.
  - Fastmail: rules with All/Any conditions (From, To/Cc/Bcc, Subject, Body, Anywhere) and actions (mark read, pin, notify, move, snooze, send a copy). "Add rule from message…" prefills the conditions.
  - Apple Mail: Rules and Smart Mailboxes.
- Feasibility: **Supported.** Generate Sieve and store it through JMAP for Sieve ([RFC 9661](https://www.rfc-editor.org/rfc/rfc9661.html)), which Stalwart implements.
- Value: **High.** Raw Sieve is out of reach for most staff, and filters are basic hygiene for work mail.
- Sources: [Gmail](https://support.google.com/mail/answer/6579), [Fastmail](https://www.fastmail.help/hc/en-us/articles/1500000278122-Mail-rules), [Apple](https://support.apple.com/guide/mail/mlhlp1017/mac)

### Finding things

**G11 Saved searches / smart folders**
- Who has it:
  - Fastmail: "Save search" puts a named search in the folder list.
  - Apple Mail: Smart Mailboxes.
  - Superhuman: splits built from searches.
- Feasibility: **Supported.** Store the query, per user and server-side so it follows the user across devices, and run it with `Email/query`.
- Value: **Medium.** Queries like "unread from the team" or "awaiting invoice" are views people revisit.
- Sources: [Fastmail](https://www.fastmail.help/hc/en-us/articles/360060591213-Searching-your-mail), [Apple](https://support.apple.com/guide/mail/use-smart-mailboxes-mlhlp1190/mac)

**G12 Attachments hub / files view**
- Who has it:
  - HEY: "All Files", a library of every received attachment.
  - Gmail: `has:attachment`, `filename:` and `larger:`.
- Feasibility: **Supported.** `Email/query` with `hasAttachment`, then read the attachment parts.
- Value: **Low-Med.** "Where's that PDF" comes up a lot, but search with an attachment filter covers it partly.
- Sources: [HEY](https://www.hey.com/features/all-files/), [Gmail](https://support.google.com/mail/answer/7190)

**G13 Sender profile / contact pane**
- Who has it:
  - Superhuman: a right-hand Contact Pane with photo, role, location, social links and the last 4 emails with the person.
  - HEY: searchable Contact Notes.
  - Fastmail: a sidebar with contact information.
- Feasibility: **Supported** for address-book data and recent threads (JMAP Contacts, [RFC 9610](https://www.rfc-editor.org/rfc/rfc9610.html); `Email/query` by `from`). **Outside service** for enrichment like LinkedIn or FullContact.
- Value: **Medium.** It's useful with outside contacts; inside the company, Suite People already has the data.
- Sources: [Superhuman](https://help.superhuman.com/hc/en-us/articles/38456037129235-Contact-Pane), [HEY](https://www.hey.com/features/contact-notes/), [Fastmail](https://www.fastmail.help/hc/en-us/articles/360058753254-Fastmail-features)

### Writing

**G14 Templates / snippets**
- Who has it:
  - Gmail: Templates (enable in Advanced), with "Save draft as template" and "Insert template" in the composer's More menu.
  - Superhuman: Snippets with variables, inserted by typing `;name`.
  - HEY: Snippets.
  - Spark: Shared Templates for teams.
- Feasibility: **Supported, plus Suite storage.** Templates can live in a Frappe doctype, which also allows team-shared ones, or as drafts in a dedicated mailbox.
- Value: **High.** Support, sales, HR and ops send the same replies daily.
- Sources: [Gmail](https://support.google.com/mail/answer/14864208), [Superhuman](https://help.superhuman.com/hc/en-us/articles/45272436606739-Your-Greatest-Hits-On-Demand), [HEY](https://www.hey.com/features/snippets/), [Spark](https://sparkmailapp.com/features)

**G15 Request read receipts (MDN)**
- Who has it:
  - Gmail: "Request read receipt" in the composer's More options, Workspace accounts only. Admins decide whether receipts go back automatically or need approval.
- Feasibility: **Supported** for requesting: add a `Disposition-Notification-To` header through `Email/set`. Suite already reads returned MDNs in Outbox. Sending receipts back means `MDN/send` ([RFC 9007](https://www.rfc-editor.org/rfc/rfc9007.html)), which Stalwart doesn't list, or Suite composing an RFC 8098 report: **backend work**.
- Value: **Low-Med.** Some formal workflows (legal, finance) expect it; many recipients ignore it.
- Sources: [Gmail](https://support.google.com/mail/answer/9413651), [Workspace admin](https://support.google.com/a/answer/1383374)

**G16 Open tracking (pixel "read statuses")**
- Who has it:
  - Superhuman: Read Statuses with a recent-opens feed, off by default, using tracking pixels.
- Feasibility: **Outside service.** It needs a public pixel endpoint plus logging.
- Value: **Low.** It's privacy-hostile and undermined by Apple Mail Privacy Protection. Recommend against.
- Sources: [Superhuman](https://help.superhuman.com/hc/en-us/articles/38457566867347-Read-Statuses-and-Recent-Opens-Feed), [Apple MPP](https://support.apple.com/guide/mail/mlhl03be2866/mac)

**G17 Emoji reactions**
- Who has it:
  - Gmail: "Add emoji reaction" next to Reply, with chips you hover to see who reacted. It's off for groups, BCC, more than 20 recipients, or more than 20 reactions to one message.
- Feasibility: **Supported.** [RFC 9078](https://www.rfc-editor.org/rfc/rfc9078.html) (Experimental) only changes the message format and needs nothing from the server. A Suite prototype exists, stashed on `feat/mail-reactions`.
- Value: **Medium.** It cuts down "thanks!" replies inside a company.
- Sources: [Gmail](https://support.google.com/mail/answer/14080429)

### Teams

**G18 Shared inboxes, delegation, send-as**
- Who has it:
  - Gmail: delegation, where a delegate reads, sends and deletes for you and sends under their own address; up to 1,000 delegates on Workspace. Google Groups Collaborative Inbox can take, assign and resolve conversations.
  - Spark: Shared Inboxes with Assign, plus "Assigned to me" and "Assigned to others" folders.
  - HEY: Extensions (group addresses such as sales@).
  - Fastmail: shared folders with view / change / share permissions and a choice between shared and per-user read state.
- Feasibility: **Backend work.** Stalwart group principals give members the group's inbox as a shared folder, and per-mailbox ACLs go through JMAP Sharing ([RFC 9670](https://www.rfc-editor.org/rfc/rfc9670.html)). Suite needs UI for shared accounts, sending as the group identity, and Suite-side records for assignment and status.
- Value: **High.** Every company has support@, sales@ and executive assistants.
- Sources: [Gmail delegation](https://support.google.com/mail/answer/138350), [Collaborative Inbox](https://support.google.com/groups/answer/2467048), [Spark](https://sparkmailapp.com/help/spark-for-teams/shared-inboxes), [HEY](https://www.hey.com/features/extensions/), [Fastmail](https://www.fastmail.help/hc/en-us/articles/360060590733-Sharing-mail), [Stalwart sharing](https://stalw.art/docs/collaboration/sharing/)

**G19 Collaboration: share a thread, private comments, shared drafts**
- Who has it:
  - Superhuman: Cmd+K > Share Conversation; Team Comments with @mention, which external recipients don't see.
  - Spark: Team Comments, Share Thread, and Shared Drafts written together in real time.
  - HEY: Shared Threads with private comments, and public shareable links.
- Feasibility: **Backend work** in Suite (Frappe stores comments and share grants), not on the mail server. Live co-editing of drafts would reuse Suite's realtime services.
- Value: **Med-High.** It replaces "FW: thoughts?", and it fits Suite's other apps.
- Sources: [Superhuman](https://help.superhuman.com/hc/en-us/articles/45272613579155-Collaborate-Without-the-Chaos), [Spark drafts](https://sparkmailapp.com/help/spark-for-teams/shared-drafts-spark), [HEY](https://www.hey.com/features/shared-threads/)

**G20 Private notes, memos and clips on threads**
- Who has it:
  - Fastmail: Memos, a yellow sticky note on a message that only you see, searchable with `memo:` and `has:memo`.
  - HEY: Thread Notes, Inbox Notes, and Clips (saved snippets of text).
- Feasibility: **Supported.** RFC 9979 registers `$memo`, `$hasmemo` and a `Memos` mailbox attribute, so a note is a message.
- Value: **Low-Med.**
- Sources: [Fastmail](https://www.fastmail.com/blog/introducing-memos/), [HEY Thread Notes](https://www.hey.com/features/thread-notes/), [HEY Clips](https://www.hey.com/features/clips-highlights/)

### Speed and control

**G21 Swipe actions on list rows (mobile)**
- Who has it:
  - Gmail: configurable left and right swipes (archive, delete, read/unread, move, snooze).
  - Fastmail: four custom swipes (short and long, each direction), with a colour each, synced per user.
  - Apple Mail: swipe for Remind Me and other actions.
  - Superhuman: swipe right to set a reminder.
- Feasibility: **Supported** (client only).
- Value: **High** on phones. Suite only swipes between open threads; triaging the list means opening each thread or selecting it.
- Sources: [Gmail](https://support.google.com/mail/answer/6562), [Fastmail](https://www.fastmail.help/hc/en-us/articles/4763978773007-Custom-swipes), [Superhuman](https://help.superhuman.com/hc/en-us/articles/46005666142733-Remind-Me)

**G22 Notification controls (VIP, per-sender, per-thread)**
- Who has it:
  - Apple Mail: VIPs, "Notify Me" on a thread, and Mute.
  - HEY: notifications off by default, turned on per contact or per thread.
  - Spark: "Smart" notifications mute strangers and automated mail, and the bell on a sender toggles it.
  - Fastmail: VIP alerts, and a "Notify me" rule action.
- Feasibility: **Backend work.** RFC 9979 has `$notify`, and Sieve can set it. Suite's push pipeline would have to honour it, alongside today's per-folder mute.
- Value: **Med-High.** Work notifications should mean colleagues and customers, not bulk mail.
- Sources: [Apple](https://support.apple.com/guide/iphone/set-email-notifications-iphc13a970c8/ios), [HEY](https://www.hey.com/features/notifications/), [Spark](https://sparkmailapp.com/features/smart_notifications), [Fastmail](https://www.fastmail.help/hc/en-us/articles/1500000278122-Mail-rules)

**G23 Print / save as PDF**
- Who has it:
  - Spark: Print, with options to include history and comments, and Save as PDF.
  - Gmail, Apple Mail: print from the message menu.
- Feasibility: **Supported** (client only: a print stylesheet or print view).
- Value: **Medium.** Invoices, contracts and records for finance, legal and HR.
- Sources: [Spark print](https://sparkmailapp.com/help/tips-tricks/how-can-i-print-an-email), [Spark PDF](https://sparkmailapp.com/blog/save-emails-as-pdf)

**G24 Offline**
- Who has it:
  - Gmail: offline in Chrome, syncing 7, 30 or 90 days with optional attachments; mail sent offline waits in an Outbox.
  - Fastmail: read, reply, contacts and calendar offline; caches recent and opened mail; can't attach files while offline.
- Feasibility: **Supported**, but a large client project: a service worker plus IndexedDB, with JMAP `/changes` state strings for resync.
- Value: **Medium.** Travel and patchy connections; big effort.
- Sources: [Gmail](https://support.google.com/mail/answer/1306849), [Fastmail](https://www.fastmail.help/hc/en-us/articles/11517883953039-Offline-support)

**G25 AI: summaries, suggested replies, writing help, auto labels**
- Who has it:
  - Gmail (Gemini): AI Overview summaries at the top of a thread, "Help me write", and suggested replies.
  - Apple Intelligence: a summary under each unread message, Priority Messages, and Smart Reply.
  - Superhuman: Auto Summarize (one line under the subject), Instant Reply (3 drafts, Tab to cycle), and Custom Auto Labels from prompts.
  - Spark: +AI.
- Feasibility: **Outside service.** Stalwart can call any OpenAI-compatible endpoint from Sieve (`llm_prompt`) and for spam classification, but a model still has to run somewhere.
- Value: **Med-High.** It's increasingly expected, but it's a policy decision (data leaves the server unless the model is self-hosted).
- Sources: [Gmail summaries](https://support.google.com/mail/answer/16561387), [Gemini in Gmail](https://support.google.com/mail/answer/14199860), [Apple](https://support.apple.com/guide/mac-help/use-apple-intelligence-in-mail-mchlb2dbea8f/mac), [Superhuman summarize](https://help.superhuman.com/hc/en-us/articles/38458640102291-Auto-Summarize), [Superhuman reply](https://help.superhuman.com/hc/en-us/articles/38458397554963-Instant-Reply), [Stalwart LLM](https://stalw.art/docs/sieve/llm/)

**G26 Translate message**
- Who has it:
  - Gmail: More > Translate message, with an automatic prompt when the language differs from yours.
- Feasibility: **Outside service** (a translation API or LLM).
- Value: **Low-Med.** It matters to multinational teams.
- Sources: [Gmail](https://support.google.com/mail/answer/13846620)

**G27 Calendar alongside mail**
- Who has it:
  - Fastmail: a sidebar with calendar and contacts.
  - Spark: Calendar & Meeting Notes.
  - HEY: HEY Calendar.
- Feasibility: **Supported** (JMAP calendars draft; Suite has a Calendar app).
- Value: **Low** for this map. Suite already does RSVP in the thread, and Calendar gets its own map.
- Sources: [Fastmail](https://www.fastmail.help/hc/en-us/articles/360058753254-Fastmail-features), [Spark](https://sparkmailapp.com/features), [HEY](https://www.hey.com/features/hey-calendar/)

**G28 Thread tools: merge threads, rename subject, reply to many at once**
- Who has it:
  - HEY: Merge Threads, Rename Subjects (visible only to you), and Reply to Everyone (one reply sent to many threads).
- Feasibility: Rename and merge are **backend work**: they need a Suite-side overlay, since JMAP threads are server-computed. A batch reply is **supported**.
- Value: **Low.**
- Sources: [Merge](https://www.hey.com/features/merge-threads/), [Rename](https://www.hey.com/features/rename-subjects/), [Reply to Everyone](https://www.hey.com/features/reply-to-everyone/)

**G29 Focus / do-not-disturb**
- Who has it:
  - Spark: Smart notifications.
  - HEY: notifications off unless chosen.
  - Apple Mail: relies on OS Focus modes.
- Feasibility: **Supported.** It's mostly G22 plus quiet hours.
- Value: **Low.** OS-level Focus covers it; fold it into G22.
- Sources: [Spark](https://sparkmailapp.com/features/smart_notifications), [HEY](https://www.hey.com/features/notifications/)

## Better elsewhere

Suite has these features already; competitors do them noticeably better.

- **Screener** (Suite has unknown-sender screening):
  - HEY routes a sender to Imbox, Feed or Paper Trail at the moment you screen them in, and has a "Speakeasy" subject code that bypasses the Screener.
  - Spark lets you choose between screening before the inbox and screening inside it, and has bulk accept/block buttons.
  - Sources: [HEY Screener](https://www.hey.com/features/the-screener/), [HEY Speakeasy](https://www.hey.com/features/speakeasy/), [Spark Gatekeeper](https://sparkmailapp.com/help/set-up-focus/accept-or-block-new-senders)
- **Command palette** (Suite's palette only searches):
  - Superhuman Cmd+K runs every action and shows each one's shortcut next to it, so the palette teaches the keys.
  - Spark has a "Command Center".
  - This matters for heavy keyboard users, and it's the gentlest way to make shortcuts discoverable without cluttering the mouse UI.
  - Sources: [Superhuman](https://help.superhuman.com/hc/en-us/articles/45191759067411-Speed-Up-With-Shortcuts), [Spark](https://sparkmailapp.com/features)
- **Search** (Suite has typed operators and filter chips, plus 5 recent searches stored per browser):
  - Gmail adds `older_than:`/`newer_than:`, `larger:`/`size:`, `filename:`, `OR`/`{}`/`()` grouping, `AROUND`, `is:muted` and `in:snoozed`.
  - Fastmail and Apple keep searches as sidebar folders (G11).
  - Sources: [Gmail operators](https://support.google.com/mail/answer/7190)
- **Remote-image and tracker protection** (Suite blocks remote images):
  - HEY's Spy Pixel Blocker names the tracker ("who's spying on you").
  - Apple's Mail Privacy Protection loads remote content privately in the background and hides your IP, so images display without exposing you.
  - Superhuman can block known tracking pixels only.
  - Sources: [HEY](https://www.hey.com/features/spy-pixel-blocker/), [Apple](https://support.apple.com/guide/mail/mlhl03be2866/mac), [Superhuman](https://help.superhuman.com/hc/en-us/articles/38457566867347-Read-Statuses-and-Recent-Opens-Feed)
- **Sender stacks vs bundles** (Suite's stacks key on name plus address, so mailing lists rarely stack):
  - HEY Bundles collapse a prolific sender into one row however much they send.
  - Apple opens non-Primary categories as a per-sender digest.
  - Sources: [HEY](https://www.hey.com/features/bundles/), [Apple](https://support.apple.com/guide/iphone/use-categories-iphfe4a36baf/ios)
- **Folder sender rules** (Suite auto-moves by sender):
  - Fastmail's "Add rule from message" prefills conditions from the open message and offers many more actions (G10).
  - Sources: [Fastmail](https://www.fastmail.help/hc/en-us/articles/1500000278122-Mail-rules)
- **Several composers at once** (Suite allows one composer, known debt #407):
  - Gmail lets you keep several compose windows open at the same time.
  - No help-centre page states this.

## Top 12 gaps to consider

Ranked by value × feasibility. Supported or small backend work ranks above large projects or outside services.

| Rank | Gap | Feasibility | Value |
|---|---|---|---|
| 1 | G07 Categories / bundles UI | Supported (backend classifier exists) | High |
| 2 | G06 Unsubscribe + subscriptions manager | Supported + thin API (RFC 8058 POST from server) | High |
| 3 | G10 Visual rules builder over Sieve | Supported (JMAP Sieve, RFC 9661) | High |
| 4 | G14 Templates / snippets | Supported + Suite storage | High |
| 5 | G21 List swipe actions (mobile) | Supported (client only) | High |
| 6 | G01 Snooze | Backend work (scheduler; no Stalwart snooze) | High |
| 7 | G02 Follow-up "if no reply" reminders | Backend work (same scheduler) | High |
| 8 | G05 Mute thread | Backend work (`$muted` + delivery hook) | Med-High |
| 9 | G18 Shared inboxes / delegation / assign | Backend work (Stalwart groups + RFC 9670) | High |
| 10 | G22 Notification controls (VIP, per sender/thread) | Backend work (`$notify` + push pipeline) | Med-High |
| 11 | G23 Print / save as PDF | Supported (client only) | Medium |
| 12 | G11 Saved searches as sidebar views | Supported | Medium |

Next in line: G17 reactions (a prototype is stashed), the action command palette (Better elsewhere), G19 thread comments and sharing, G09 labels UI, and G25 AI summaries and replies (outside service; a policy decision first). G01 and G02 share one scheduler, so building them together roughly halves the backend cost.
