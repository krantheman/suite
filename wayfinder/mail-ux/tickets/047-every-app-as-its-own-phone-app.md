---
id: 047
title: Every app as its own phone app
label: wayfinder:grilling
status: open
assignee:
blocked-by: []
---

## Question

On a phone, Suite is one app: one PWA, installed once, with a bottom bar of
every area (Home, Drive, Mail, Calendar, Meet, People, Account). It is to
become one app per product instead: Mail, Calendar, Drive, Writer, Sheets,
Slides, Meet, each installed and opened as an app of its own (the user,
2026-10-19, agreed with Faris, whose unified-frontend plan made Suite one PWA
in its tickets T010 and T018). Decide what that takes and how the apps share
what they must:

- each app's manifest: name, scope, start URL, icon, splash, theme;
- what stands where the shell's bottom bar was inside one app, and how the
  other areas are reached from it, if at all;
- push: one service worker for all or one each, and which app a
  notification opens;
- sign-in shared across all of them, and logout from one;
- links between apps (an invite in a mail opening Calendar, a Drive link in
  a mail opening Drive), and a desktop browser, which keeps the one Suite;
- what becomes of the one Suite PWA for those who installed it;
- how installing is offered, if at all, without nagging (below).

**The install prompt nags** (Ayush, 2026-10-19, with a screenshot from a
phone's browser): "Install Frappe Suite" opens as a dialog over the Inbox every
time Mail is opened in a browser, even for someone who has installed the app,
and closing it is never remembered. Using Mail in a browser is a fair choice of
its own; installing should be an offer the person can turn down for good, not a
dialog on every visit. Decide where the offer lives (a quiet banner, or only in
the account menu), when it shows (once, or again after a while), and how an
installed app is recognised (`getInstalledRelatedApps`, the app's own scope).
It can be stopped from nagging now, before the split: a dismissal remembered
on the device is the least of it.

The split is decided; how is the question. [Mail on a phone](040-mail-on-a-phone.md)
waits on it, as each product's own phone design does.

## Decisions so far

- 2026-10-19, the user: **each app is installable from its own pages.** The
  manifest a page links to follows the route: on `/mail` it is Mail's (scope
  `/mail`, Mail's name, icon and start URL), on `/calendar` Calendar's, and so
  on, so installing from wherever you are installs that product's app. A route
  outside any one product's (the Suite home, say) offers none, or the Suite.
- 2026-10-19, the user: **Mail's app keeps a bottom bar of its own: Mailbox,
  Search, Profile,** as develop has it (`components/mobile/MobileTabBar.vue`
  on develop), and no Suite bar. Mailbox is the current folder, by its icon and
  name, and tapping it again opens the folders; Search moves down from the top
  bar, which loses it, and so does the ☰ (the folder tab opens the folders).
  No Screener tab: screening now happens in the Inbox (unknown senders are
  marked there). Kept after trying it against no bottom bar at all (☰ and
  Search in the top bar) in a prototype (local branch `proto/phone-nav`): the
  folders and Search stay under the thumb, and the folder you are in stays in
  sight.
- 2026-10-19, the user: **the nagging install prompt waits for the split,** not
  a stopgap on develop: it is redone here with the per-app install.

## Inputs

- `frontend/src/shell/InstallPrompt.vue`: shows its dialog whenever the browser
  fires `beforeinstallprompt`, on every area page, with nothing remembered when
  it is closed; iOS gets an "add to home screen" message whenever the page is
  not running standalone. The same component is on develop, so production does
  this today.

- `frontend/src/platform/pwa/index.ts`: the one Suite PWA. The manifest and the
  iOS install tags sit on every route; the push worker is Mail's FCM worker
  (`src/apps/mail/sw.ts`, built to `sw.js`), registered on sign-in.
- `frontend/vite.config.ts`: VitePWA with `manifest: false`; the webmanifest is
  served by the site.
- Native apps through Capacitor come after this:
  [Native apps](048-native-apps.md).
