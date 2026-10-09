# Unknown senders: how other mail products handle them

Date: 2026-10-09. Answers [ticket 014](../tickets/014-unknown-sender-handling-elsewhere.md) and feeds [ticket 013](../tickets/013-unknown-senders.md).

## Sources and method

- Vendor docs: help.hey.com, hey.com (feature pages and the [changelog](https://www.hey.com/new/)), support.google.com, support.apple.com, fastmail.help and fastmail.com, sparkmailapp.com, support.microsoft.com and learn.microsoft.com.
- help.superhuman.com refuses automated fetches (HTTP 403), so Superhuman claims come from search-engine extracts of those articles. The links go to the real pages.
- Criticism comes from first-hand reviews and user threads, each cited where used: Nathan Baschez (Every), Philip Storry, Brian Li, Oliver Palmer, Josh Ginter (The Sweet Setup), Joe Rosensteel (Six Colors), Hacker News threads, a US bankruptcy court notice and Microsoft Q&A. Two pages refused automated fetches: Fast Company's HEY reviews and Justin Harter's 2022 HEY review. Fast Company is not used. Harter is used once, from a search extract, and marked as such.
- Cross-references, not repeated here:
  - [feature-gap-survey.md](feature-gap-survey.md): G07 categories, G22 notification controls, and "Better elsewhere" (Screener, remote images).
  - [github-issues.md](github-issues.md): group I19, where a decision about a sender doesn't reach mail you already have.
  - [heuristic-audit.md](heuristic-audit.md): A31 and A34 to A37 on Suite's unknown-sender UI.

## Suite today, the baseline

From `frontend/src/apps/mail/composables/useScreener.ts`, `suite/mail/doctype/sieve_script/sieve_script.py` (`build_screening_gate`), `suite/mail/api/mail.py` (`auto_accept_recipients`) and `suite/mail/doctype/jmap_account/jmap_account.json`:

- **Default.** Screening is a per-account switch. It is off in the field default, and the field description says it is on by default for personal accounts.
- **While undecided.** Non-spam mail from a sender who isn't on the Accepted list goes to the Inbox with the `unscreened` keyword. The row shows an unknown-sender icon, and the open thread asks "Do you want mail from X?" with No and Yes. Yes offers either the one sender or their domain, and shared domains such as gmail.com are never offered.
- **Spam from a stranger** is left to Stalwart and goes to Junk. Stalwart overrides that when the sender is a contact or replied to your mail.
- **Trusted automatically:**
  - The account's own addresses.
  - Everyone you send to. `auto_accept_recipients` runs on send. It never overrides an existing block.
  - Admin-managed global Accepted rules, which can be an address or an `@domain`.
- **Implicit decisions.** Reply, star, or a move anywhere except Junk (Trash included) accepts the sender. Junk or No blocks them, and their future mail goes to Junk.
- **Mail already received.** `on_block_old_mail` is Ask, Move to Junk or Keep, and applies to the blocked sender's mail in the Inbox. Trusting a domain does not move that domain's mail out of Junk (I19).
- **Images.** Remote images from senders you haven't accepted stay blocked (`block_remote_images`, on by default). They can be loaded per message, and accepting a sender loads them for good.

## HEY

- **Mechanism.** A gate. A first-time sender's mail goes to The Screener, a separate place outside the Imbox. You answer Yes or No, and Yes can also route the sender to the Imbox, The Feed or the Paper Trail. A spam filter runs before the gate. HEY says the Screener exists for mail that "would never be considered spam", such as newsletters someone else signed you up for, salespeople and friends of friends. ([The Screener feature page](https://www.hey.com/features/the-screener/), [help: The Screener](https://help.hey.com/article/722-the-screener), [How HEY works](https://www.hey.com/how-it-works/))
- **While undecided.**
  - Mail waits in The Screener (app.hey.com/clearances), unseen in the Imbox. HEY shows a count of senders waiting; it shows no other counts anywhere ([Storry](https://www.philipstorry.net/review/hey-reinventing-email/)).
  - Notifications can be turned on for chosen contacts or threads. There is no general new-mail notification, so strangers never notify ([Storry](https://www.philipstorry.net/review/hey-reinventing-email/); [oezi on HN](https://news.ycombinator.com/item?id=27631243)).
  - Forwarding mail out of HEY ignores the Screener ([help: Forwarding](https://help.hey.com/article/1055-forwarding)).
- **Decision unit.** Each email address on its own, or a whole domain from the sender's contact page: "Automatically screen them to the Imbox", "Automatically screen them out" or "I'll screen them individually". Large domains such as gmail.com can't be screened out whole. ([help](https://help.hey.com/article/722-the-screener))
- **Reversal.** Screener History lists everyone you screened out, and you can screen them back in from there. You can also screen out a contact you accepted earlier, from Contacts, then "Delivering To", then "Screened Out". ([help](https://help.hey.com/article/722-the-screener))
- **Mail already received.**
  - Screening someone back in shows their mail from the last 90 days ([feature page](https://www.hey.com/features/the-screener/)).
  - Screened Out and Spam are deleted automatically after 90 days ([help: Empty Trash, Spam, or Screened Out](https://help.hey.com/article/1014-empty-trash-spam-or-screened-out)).
  - Routing a contact can move "all emails from someone" after the fact ([help: The Imbox](https://help.hey.com/article/759-imbox)).
- **Protecting first contact from someone important:**
  - Contacts you add by hand or import bypass the Screener ([help](https://help.hey.com/article/722-the-screener)).
  - The Speakeasy code is a word you hand out. If it appears in the subject, the mail skips the Screener and gets "special treatment in your Imbox". The code can be regenerated, and an old code still delivers, just without the fast track. ([help: The Speakeasy Code](https://help.hey.com/article/773-the-speakeasy-code), [feature page](https://www.hey.com/features/speakeasy/))
  - Whether replies to mail you sent skip the Screener is not documented in HEY's help. A search-engine summary claimed they do, but no primary page confirms it.
- **What HEY has patched since launch** ([changelog](https://www.hey.com/new/)). Each entry is a fix for friction:
  - "Clearing The Screener", for when it is "backed up" with "100+ emails", lets you clear it without deciding each sender.
  - "Screen in & Reply" replaces screen in, find it in the Imbox, then reply.
  - "Screen in to Imbox and mark seen" exists because you have often read the mail already in the Screener.
  - Recipients and timestamps in the Screener preview give you context to decide.
  - A Spam button in the Screener (Spam Corps) blocks the sender and feeds the spam filter, because spam reaches the Screener ([help: Spam Corps](https://help.hey.com/article/889-spam-corps)).
- **Documented criticism:**
  - **Missed first contact.** The "biggest fail is missing notifications for first time senders": HEY assumes you check mail constantly, and mail sat unscreened for days ([oezi](https://news.ycombinator.com/item?id=27631243)). Another user cancelled over paranoia about missed mail ([600frogs](https://news.ycombinator.com/item?id=27631243)). Another worried about time-critical mail such as concert tickets from new senders ([alberth](https://news.ycombinator.com/item?id=27631243)).
  - **Backlog.** Early users "went nuts" with thousands of emails to screen ([noyesno](https://news.ycombinator.com/item?id=27218295)). HEY's own "Clearing The Screener" entry describes the same thing.
  - **A chore when there's little spam.** Brian Li cancelled because screening "started feeling like more of a chore" when he got little spam to begin with ([Li, Dec 2020](https://brianli.com/2020/12/i-canceled-my-hey-email-subscription/)). Oliver Palmer did not want to send ordinary correspondents "down a trapdoor" ([Palmer, Jul 2020](https://www.oliverpalmer.com/blog/hey-email-review/)).
  - **Permanence makes No hard to press.** A No feels more permanent than archiving, so you hesitate for fear of missing something later. The separate Screener and Imbox screens are "high-friction". ([Baschez, Every, Jul 2020](https://every.to/divinations/product-case-study-hey-627136))
  - **Password resets from unexpected addresses.** Screening is per address, so a service's reset mail can come from an address you never screened in. Users hesitate to screen services out because of this. (Justin Harter's 2022 review, from a search extract; the page refused a direct fetch: [justinharter.com](https://justinharter.com/hey-email-review-2022/))
  - **Is the Screener just a second spam folder?** Asked at launch ([usaphp](https://news.ycombinator.com/item?id=23594138)). HEY's later Spam Corps button concedes that spam does reach it.
  - **Positive verdicts.** "A little demanding when you first start it, but after a couple of days it's fine" ([Storry](https://www.philipstorry.net/review/hey-reinventing-email/)). Rejecting a sender is better than unsubscribing because their mail stays visible under Screened Out ([Ginter, Jul 2020](https://thesweetsetup.com/hey-email-disrupted-my-email-workflow/)). A user plagued by agency spam that has no unsubscribe link and rotates addresses found it decisive ([Hulry](https://hulry.com/hey-email-review/)).
  - **The Speakeasy code is hard to find:** "a small unlabelled icon" ([Storry](https://www.philipstorry.net/review/hey-reinventing-email/)).

## Gmail

- **Mechanism.** Classifiers, no gate.
  - The spam filter learns from reports ([help](https://support.google.com/mail/answer/1366858)).
  - Inbox categories: Primary ("people you know and messages that don't appear in other tabs"), Social, Promotions, Updates and Forums ([help](https://support.google.com/mail/answer/3094499)).
  - Importance markers are based on whom you email and how often, what you open, reply to, star, archive or delete, and keywords ([help](https://support.google.com/mail/answer/186543)).
- **While undecided.** There is no undecided state; every message is classified when it arrives. Only Primary notifies ([help](https://support.google.com/mail/answer/3094499)).
- **Block list.** A blocked sender's future mail goes to Spam, and unblocking sends their future mail to the Inbox. The help page describes only future mail. ([help](https://support.google.com/mail/answer/8151))
- **Allow-list.** Adding a sender to Google Contacts stops their mail going to Spam, and so does "Not spam" on one of their messages ([help](https://support.google.com/mail/answer/1366858)). Dragging a message to another tab only trains the classifier. A filter is needed to send a sender to a tab for good. ([help](https://support.google.com/mail/answer/3094499))
- **Sender verification and warnings:**
  - Gmail warns about lookalike addresses, phishing, unconfirmed senders, empty messages and compromised contacts ([help](https://support.google.com/mail/answer/1366858)).
  - A blue checkmark means the sender proved ownership of the address and logo through BIMI, VMC and DMARC ([help](https://support.google.com/mail/answer/13130196)).
- **Images.** Gmail proxies and scans all images. You can choose "ask before displaying", and suspicious messages hide images. There is no per-sender allow. ([help](https://support.google.com/mail/answer/145919))
- **First contact from someone important.** Nothing specific. Person-to-person mail tends to land in Primary. Superhuman's critique: Priority Inbox learns from past behaviour, so "new client leads and unexpected opportunities won't be categorized as Priority" ([Superhuman blog, Dec 2021](https://blog.superhuman.com/priority-inbox/)).
- **Documented criticism:**
  - Legitimate mail goes to Spam. Reports include a personal reply, a government property-tax notice, two weeks of a teacher's mail, Google Calendar notifications, and gym receipts that needed six months of "not spam" ([HN, Jan 2023](https://news.ycombinator.com/item?id=34411009)).
  - Gmail rejects or misfiles mail from small, correctly configured servers, and senders have no recourse ([HN on "Google Is Eating Our Mail", Apr 2019](https://news.ycombinator.com/item?id=19756125)).

## Apple Mail (iPhone, Mac, iCloud)

- **Mechanism.** Classifiers and a block list, no gate.
  - Categories: Primary ("personal messages, direct communications, and time-sensitive information"), Transactions, Updates and Promotions. When mail in another category carries time-sensitive information, Mail also shows it in Primary. ([iPhone](https://support.apple.com/guide/iphone/use-categories-iphfe4a36baf/ios), [Mac](https://support.apple.com/guide/mail/use-categories-mlhl64d76621/mac), [iCloud](https://support.apple.com/guide/icloud/use-categories-mmafbebd3108/icloud))
  - Apple filters unknown senders in Messages and screens unknown callers in Phone, but Mail only blocks ([Apple personal-safety guide](https://support.apple.com/guide/personal-safety/block-screen-and-filter-communications-ipsac1e87c54/web)).
- **Allow-list.** On the Mac, the junk filter can skip senders who are in Contacts, people you've corresponded with before, and mail that uses your full name ([Junk Mail settings](https://support.apple.com/guide/mail/change-junk-mail-preferences-cpmlprefjunk/mac)).
- **Block list.** Blocked mail goes to Trash, or on the Mac can be "Mark as blocked mail, but leave it in my Inbox" with a banner ([Mac Blocked settings](https://support.apple.com/guide/mail/change-blocked-settings-mlhle407d4a3/mac), [iPhone](https://support.apple.com/guide/iphone/flag-or-block-emails-iph3caefa61/ios)). The list is shared with Phone and Messages under Blocked Contacts.
- **Reversal and mail already received.** "Categorize Sender" moves all current and future messages from that sender to the chosen category ([iPhone](https://support.apple.com/guide/iphone/use-categories-iphfe4a36baf/ios)). This is the only per-sender decision in the survey documented to reach existing mail by default.
- **Privacy.** Mail Privacy Protection hides your IP address and loads remote content privately, so senders can't tell when you open their mail. "Block All Remote Content" is a separate option. ([iPhone](https://support.apple.com/guide/iphone/use-mail-privacy-protection-iphf084865c7/ios))
- **First contact from someone important.** Only the time-sensitive copy in Primary and the VIP list.
- **Documented criticism:**
  - Misfiling, with no visible logic, no custom categories and no rules. Moving a sender to Primary loses the per-sender digest. ([Rosensteel, Six Colors, Dec 2024](https://sixcolors.com/post/2024/12/ios-18-2-mail-is-a-misfire/))
  - A US bankruptcy court warned that court e-filing (CM/ECF) and GovDelivery notices were being filed as Updates and taken out of the Inbox ([Bankr. N.D. Fla. notice, Feb 2025](https://www.flnb.uscourts.gov/node/1120)).

## Fastmail

- **Mechanism.** A spam filter plus your contacts as the allow-list, and a gate you build yourself.
  - Contacts skip greylisting and get a spam score of 0. Fastmail has no separate trusted-senders list. An `*@domain` contact trusts a whole domain. ([Improving spam protection](https://www.fastmail.help/hc/en-us/articles/1500000278142-Improving-spam-protection))
  - Spam levels decide what goes to the Spam folder and what is discarded ([Spam filtering](https://www.fastmail.help/hc/en-us/articles/360060591413-Spam-filtering)).
  - A compose option saves new recipients to an Autosaved contact group, which puts the people you write to on the allow-list ([Using Contacts](https://www.fastmail.help/hc/en-us/articles/1500000280101-Using-Contacts), via search extract).
- **Gate (optional).** Fastmail's own article "Screening emails" describes a rule: "Sender is not a contact" moves mail to a "Screen Emails" folder, and you accept a sender by adding them to contacts ([help](https://www.fastmail.help/hc/en-us/articles/8661280554511)). There is no dedicated UI, no implicit acceptance, and no warning about what the rule can catch.
- **Block list.** Blocked senders and domains go to Trash ([Rules](https://www.fastmail.help/hc/en-us/articles/1500000278122-Organizing-your-inbox-with-Rules), [How to stop spam](https://www.fastmail.com/how-to/stop-spam/)).
- **Mail already received.** A new rule can be applied to matching mail already in the mailbox. The help pages document no such option for blocking or spam settings. ([Rules](https://www.fastmail.help/hc/en-us/articles/1500000278122-Organizing-your-inbox-with-Rules))
- **Images.** "Show remote images from senders in my contacts, otherwise ask" ([Blocking remote images](https://www.fastmail.help/hc/en-us/articles/1500000278102-Blocking-remote-images)). This option dates from 2006, where a known sender meant someone in your address book ([blog](https://www.fastmail.com/blog/new-web-bug-option-show-images-for-known-senders/)). So trusting a sender's images follows the same contact list as trusting their mail.
- **First contact from someone important.** Nothing beyond the spam filter. If you build the rule-based gate, first contact waits in a folder nobody is notified about.
- **Documented criticism.** No product-specific criticism of the screening rule was found. In the HN threads above, Fastmail is the most-recommended alternative for people leaving Gmail and HEY.

## Superhuman

- **Mechanism.** Classifiers and splits, no gate. Superhuman runs on top of Gmail and Outlook, so their spam filters apply.
  - The default splits are Important (person-to-person and high-priority mail), Other (marketing, social, automated updates), VIP and Team. VIP and Team mail also shows in Important. ([Default Split Inbox](https://help.superhuman.com/hc/en-us/articles/38458392810643), [Split Inbox Basics](https://help.superhuman.com/article/581-split-inbox-basics))
  - Auto Labels mark Marketing, Cold Pitch, Social and News. Auto Archive can archive those labels on arrival. Business plans can add AI-prompt labels. ([Auto Labels](https://help.superhuman.com/hc/en-us/articles/40127432866323))
- **Block list.** Cmd+K then Block blocks a sender or their domain, and the list is under Cmd+K then Block Senders. Mark Spam can also block the full address or the domain. ([Dealing with Unwanted Emails](https://help.superhuman.com/hc/en-us/articles/38458459391635-Dealing-with-Unwanted-Emails))
- **Mail already received.** The unsubscribe actions do reach it: "Unsubscribe, and Mark Done all" and "Unsubscribe, and Trash all" act on that sender's mail already in the inbox ([same page](https://help.superhuman.com/hc/en-us/articles/38458459391635-Dealing-with-Unwanted-Emails)).
- **Unknown senders.** "Cold Pitch" is the only mechanism aimed at unsolicited human mail. It decides per message by content, not per sender.
- **Images.** Superhuman can block known tracking pixels only (see [feature-gap-survey.md](feature-gap-survey.md)).
- **First contact from someone important.** Person-to-person mail goes to Important by default, so a stranger who writes personally is shown, not held back.
- **Documented criticism.** At launch, users couldn't edit the prompt behind a label; you had to make a new one ([TechCrunch, Feb 2025](https://techcrunch.com/2025/02/19/superhuman-introduces-ai-powered-categorization-to-reduce-spammy-emails-in-your-inbox)). A real first contact that reads like a pitch can be labelled Cold Pitch and auto-archived. That follows from the design; no report of it happening was found.

## Spark

- **Mechanism.** A gate (Gatekeeper, released October 2022), plus the Smart Inbox classifier: personal, notifications and newsletters ([9to5Mac, Oct 2022](https://9to5mac.com/2022/10/04/spark-mail-app-major-update/), [Smart Inbox](https://sparkmailapp.com/features/smart_inbox)).
- **Gatekeeper modes** ([help](https://sparkmailapp.com/help/set-up-focus/accept-or-block-new-senders)):
  - "Screen new senders before inbox": a New senders section at the top of the Inbox. This is the help centre's default.
  - "Screen new senders inside inbox": mail lands normally and the prompt appears when you open it.
  - "Don't review": accept everyone.
  - A Spark how-to says "by default, Spark accepts all senders except those you previously blocked", which suggests Gatekeeper is opt-in ([how-to](https://sparkmailapp.com/how-to-block-emails-ios)). The two pages disagree about the default.
- **Decision unit and bulk.** Addresses or domains. Public and root domains can't be blocked. Thumbs up or down at the top accepts or blocks every sender waiting. ([help](https://sparkmailapp.com/help/set-up-focus/accept-or-block-new-senders))
- **Reversal.** A Blocked section in the sidebar: open one of the sender's mails and press "Accept sender". Blocked senders' future mail is "stowed away in the blocked folder". ([help](https://sparkmailapp.com/help/set-up-focus/accept-or-block-new-senders), [Spark blog](https://sparkmailapp.com/blog/how-to-block-emails-gmail-icloud-outlook))
- **Mail already received.** Not documented.
- **Notifications.** Smart Notifications "mute strangers and automated emails" and let priority senders through ([Smart Notifications](https://sparkmailapp.com/features/smart_notifications)). So by default a stranger's first mail doesn't notify, gate or no gate.
- **First contact from someone important.** Nothing documented beyond "inside inbox" mode, which keeps first contact visible.
- **Documented criticism.** No substantive criticism of Gatekeeper itself was found. Reviews of Spark 3 complain about the app overall.

## Outlook (Outlook.com, new Outlook, classic Outlook, Microsoft 365)

- **Mechanism.** A classifier (Focused Inbox), user lists (Safe and Blocked senders), an optional allow-list mode, and admin-side first-contact warnings.
  - Focused Inbox splits the Inbox into Focused and Other, based on whom you interact with and with bulk or automated mail filtered out. "You'll be informed about email flowing to Other." It can be turned off. ([Focused Inbox](https://support.microsoft.com/en-us/outlook/mail/focused-inbox-for-outlook))
  - Safe senders and domains never go to Junk. Blocked senders go "directly to your Junk Email folder". Up to 10,000 entries. ([Block or unblock senders](https://support.microsoft.com/en-us/outlook/mail/block-or-unblock-senders-in-outlook), [Filter junk email](https://support.microsoft.com/en-us/outlook/filter-junk-email-and-spam-in-outlook))
  - **Allow-list mode:**
    - Outlook on the web can "treat all email as junk unless it comes from someone included in your Safe Senders and Recipients list or local senders" ([Block or allow](https://support.microsoft.com/en-us/outlook/block-or-allow-junk-email-settings)).
    - Classic Outlook calls this "Safe Lists Only" ([level of protection](https://support.microsoft.com/en-us/outlook/change-the-level-of-protection-in-the-junk-email-filter-in-outlook)). Microsoft has a known-issue page titled "Some Junk Mail goes to Inbox after configuring Junk Email Options to 'Safe Lists Only'" ([known issue](https://support.microsoft.com/en-us/support/known-issues/some-junk-mail-goes-to-inbox-after-configuring-junk-email-options-to-safe-lists-only)).
  - Classic Outlook has "Also trust email from my Contacts" and "Automatically add people I email to the Safe Senders List" ([Junk Email Filters](https://support.microsoft.com/en-US/Outlook/use-junk-email-filters-to-control-which-messages-you-see)).
- **While undecided.** There is no undecided state. Junk is a suspected-spam folder. Microsoft states its retention two ways: deleted after 30 days ([Filter junk email](https://support.microsoft.com/en-us/outlook/filter-junk-email-and-spam-in-outlook)) and after 14 days ([Block or unblock senders](https://support.microsoft.com/en-us/outlook/mail/block-or-unblock-senders-in-outlook)).
- **Reversal and mail already received.** "Always move to Focused" or "Always move to Other" applies to "all future messages from the sender" ([Focused Inbox](https://support.microsoft.com/en-us/outlook/mail/focused-inbox-for-outlook)). Blocking is documented only for future mail.
- **Sender verification and first-contact warning** (Microsoft 365, set by admins) ([anti-phishing policies](https://learn.microsoft.com/en-us/defender-office-365/anti-phishing-policies-about)):
  - The first contact safety tip adds "You don't often get email from <address>" the first time someone writes, or when they write rarely. With several recipients it reads "Some people who received this message…", decided by a majority model. Microsoft notes this can expose one recipient's habits to another.
  - A "(?)" on the sender's photo means the mail failed authentication.
  - A "via" tag shows when the From domain differs from the DKIM signature or envelope domain.
  - Defender adds lookalike-name and lookalike-domain warnings, and mailbox intelligence that uses contact history.
- **First contact from someone important.** The safety tip marks first contact as unusual rather than important. Focused Inbox can file a new human sender under Other.
- **Documented criticism:**
  - **The safety tip can't be switched off.** Even disabled in policy it keeps appearing, it breaks message previews, and it fires for long-time contacts ([Microsoft Q&A, Apr 2024 – Aug 2025](https://learn.microsoft.com/en-us/answers/questions/1640992/first-contact-safety-tip-please-provide-a-method-t); many similar threads).
  - **Important mail lands in Other.** University IT pages tell staff to turn Focused Inbox off for this reason (e.g. [University of Utah Student Affairs, May 2023](https://studentaffairs.utah.edu/sa-staff-blog/posts/2023/May/disable_focused_inbox.php)).

## Comparison

| | Gate on first contact | On by default | Where undecided mail waits | Trusted without asking | Decision unit | Decision reaches existing mail | Reversal | Strangers' images | Strangers notify |
|---|---|---|---|---|---|---|---|---|---|
| **HEY** | Yes, The Screener | Yes | Separate queue, out of the Imbox | Contacts you add or import; Speakeasy subject code | Address or domain (not big free domains) | Re-screening in shows 90 days; routing can move all past mail | Screener History; contact page | Spy pixels blocked for all | No (notifications are per contact) |
| **Spark** | Yes, Gatekeeper | Help pages disagree | New senders section atop Inbox, or in Inbox with a prompt | Not documented | Address or domain (not public domains) | Not documented | Blocked section, "Accept sender" | Not documented | No (Smart notifications mute strangers) |
| **Suite** | Marked, not held | Off; on for personal accounts | Inbox, marked `unscreened` | Your own addresses, people you send to, admin global rules | Address or domain (not shared domains) | Block: Ask, Move or Keep for Inbox mail. Trust: not to Junk (I19) | Settings, Screener table | Blocked until accepted | Not checked here |
| **Fastmail** | Only with your own rule | No | A folder you name | Contacts, optionally auto-saved recipients | Address or `*@domain` contact | Rules yes; blocks not documented | Edit contacts or blocks | Contacts only, otherwise ask | Not documented |
| **Outlook** | Only in "Safe Lists Only" mode | No | Junk (allow-list mode) or Other | Safe senders, contacts, optionally people you email | Address or domain | Future only (documented) | Edit lists; Always move to… | Not covered here | Other tab "informed" |
| **Gmail** | No | n/a | n/a (classified on arrival) | Contacts skip Spam; Primary learns from who you email | Per message (filters per sender) | Block: future only | Unblock; Not spam | Proxied; optional ask; no per-sender allow | Primary only |
| **Apple Mail** | No | n/a | n/a | Contacts, past correspondents, full-name mail skip junk (Mac) | Per sender (Categorize Sender) | Yes, current and future | Re-categorize; unblock | Privacy Protection proxies everything | Not covered here |
| **Superhuman** | No | n/a | n/a (Important vs Other) | VIPs and team | Per message (AI labels) | Unsubscribe-and-archive/trash-all reaches it | Edit labels; unblock | Known pixels only | Not covered here |

## Documented failure modes

1. **First contact from someone who matters gets lost.**
   - In gates, because held mail doesn't notify and waits in a place you have to visit: HEY (oezi, 600frogs and alberth above).
   - In classifiers, because new senders have no history: Gmail spam and Priority, Apple Updates (the court notice), Outlook Other.
   - Superhuman's own pitch names the classifier version: "new client leads… won't be categorized as Priority".
2. **The queue backs up when neglected.** HEY users faced thousands of senders. HEY shipped "Clearing The Screener" for "100+ emails" and a bulk punt. Spark ships bulk accept and block.
3. **Transactional mail comes from addresses you can't predict.** Password resets, receipts and verification codes come from new or rotating addresses, which a per-address gate catches. HEY answers with domain screening and the Paper Trail, and Apple and Gmail answer with Transactions and Updates. Reports: Harter (resets, from a search extract), alberth (tickets), the HN Gmail thread (gym receipts in Spam).
4. **Decision fatigue, or a chore when spam is rare.** Li, Palmer and Baschez. The cost falls on every legitimate sender, not on the unwanted ones.
5. **Fear of permanence makes No hard to press** (Baschez). It gets worse when the outcome is silent deletion: HEY empties Screened Out after 90 days, and Outlook empties Junk after 14 or 30 days.
6. **Decisions don't reach mail already received.** Gmail, Outlook and Fastmail document blocking as future-only. Apple's Categorize Sender, Fastmail's rules and Superhuman's unsubscribe-all do reach existing mail. HEY's screen-in brings back 90 days. Suite's block asks, and its trust doesn't reach Junk (I19).
7. **The gate becomes a second spam folder.** Spam slips past the filter into the queue. A launch-time HN question; HEY later added a Spam button in the Screener.
8. **Opaque classification erodes trust.** You can't see why Apple filed something where it did (Rosensteel). At launch you couldn't edit a Superhuman label's prompt.
9. **Warnings people learn to ignore.** Outlook's first-contact tip fires for long-time contacts and can't be switched off (Microsoft Q&A).
10. **Bypasses depend on the sender and on finding the setting.** Speakeasy only works if you hand out the code and the sender types it in the subject, and the code sits behind "a small unlabelled icon" (Storry).
11. **Trust and visibility get tied together.** Fastmail ties images to contacts, and Suite ties images to acceptance. You can't trust a sender's images without trusting their mail, or the other way round (see audit A31 for Suite).

## Candidate root problems

The distinct user problems these mechanisms target, which mechanisms address each, and where Suite's current design stands. No recommendations.

| # | User problem | Addressed by | Suite today |
|---|---|---|---|
| R1 | **Unwanted mail that isn't spam reaches the place where you work**: cold sales, lists someone else signed you up to, rotating agency senders. | Gates (HEY Screener, Spark "before inbox", Fastmail's contact rule, Outlook Safe Lists Only), Superhuman Cold Pitch with Auto Archive, block lists everywhere. | Unscreened mail stays in the Inbox, marked, so it still arrives there. Suite identifies it but doesn't remove it. No blocks the sender, and future mail goes to Junk. |
| R2 | **Telling wanted from unwanted costs time.** | Classifiers do it with no user effort but misfile: Gmail tabs, Apple categories, Focused Inbox, Superhuman splits and labels, Spark Smart Inbox. Gates turn it into one decision per sender, at the price of decision fatigue and backlog (failure modes 2 and 4). | One decision per sender, made implicitly through ordinary actions (reply, star, move), with no separate queue to clear. No categories for accepted mail (ticket 010, survey G07). |
| R3 | **First contact from someone who matters gets missed.** | Shown by default: Superhuman Important (person-to-person), Apple time-sensitive copy in Primary, Spark "inside inbox". Bypasses: HEY Speakeasy, contacts as allow-list (HEY, Fastmail, Gmail, Apple, Outlook). Overrides: Outlook "Always move to Focused", Superhuman VIP. Gates and history-based classifiers cause this problem; only HEY's Speakeasy targets it directly. | Unscreened mail is visible in the Inbox, and people you have written to are accepted. Whether unscreened mail sends push notifications was not checked here. |
| R4 | **Strangers track you** through pixels and IP. | HEY spy-pixel blocking and image proxy, Apple Mail Privacy Protection, Gmail proxy, Fastmail images from contacts only, Superhuman known pixels only. | Remote images blocked until a sender is accepted (on by default), with a per-message load. Image trust is tied to accepting the sender (failure mode 11). |
| R5 | **Strangers impersonate someone you know.** | Outlook first-contact tip, "(?)" and "via" indicators, Defender lookalike warnings; Gmail spoof and phishing warnings and BIMI checkmark. Gates work against impersonation by accident, because a lookalike address is always a new sender. | The unknown-sender icon and banner tell you it's first contact. They say nothing about authentication or lookalikes, and other warnings weren't checked here. |
| R6 | **Decisions don't stick or don't reach mail already received** (issues I19). | Apple Categorize Sender (current and future), Fastmail rules applied to existing mail, Superhuman unsubscribe-and-archive-all, HEY 90-day restore on screen-in. Gmail, Outlook and Fastmail blocks are future-only. | Partly. Block offers Ask, Move or Keep for Inbox mail. Trusting a domain leaves its Junk mail behind. Each path handles existing mail differently (I19 note). |
| R7 | **Automated mail from addresses you can't predict** (resets, receipts, codes) misfires against a per-address decision. | HEY domain screening and Paper Trail routing, Apple Transactions, Gmail Updates, Spark notifications category. | Accepting a sender is per address or per domain, and shared domains can't be trusted whole. Accepted mail isn't routed anywhere special. |
| R8 | **At work, colleagues and partners shouldn't need screening.** | HEY domain auto-screen-in, Outlook trusts "local senders" (the organisation) in allow-list mode, Defender mailbox intelligence. | Your own addresses and people you send to are trusted. Admins can add global Accepted addresses or `@domains`. Whether the organisation's own domain is accepted without setup was not checked here. |
