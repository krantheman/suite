---
id: 047
title: Mail and Calendar as their own phone apps
label: wayfinder:grilling
status: open
assignee:
blocked-by: []
---

## Question

On a phone, Suite is one app: one PWA, installed once, with a bottom bar of
every area (Home, Drive, Mail, Calendar, Meet, People, Account). The user wants
Mail and Calendar instead, each installed and opened as an app of its own
(2026-10-19). Decide what that takes and how the two share what they must:

- each app's manifest: name, scope, start URL, icon, splash, theme;
- what stands where the shell's bottom bar was inside one app, and how the
  other areas are reached from it, if at all;
- push: one service worker for both or one each, and which app a
  notification opens;
- sign-in shared across both, and logout from one;
- a link to the other app (an invite in a mail opening Calendar), and a
  desktop browser, which keeps the one Suite;
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

This reverses a platform decision: the unified-frontend plan made Suite one
PWA (its tickets T010 and T018), which is Faris's. Settle it with him before
building. [Mail on a phone](040-mail-on-a-phone.md) waits on it; Calendar's
phone design, on the Calendar side, does too.

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
  [Mail and Calendar as native apps](048-native-apps.md).
