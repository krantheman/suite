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
- what becomes of the one Suite PWA for those who installed it.

This reverses a platform decision: the unified-frontend plan made Suite one
PWA (its tickets T010 and T018), which is Faris's. Settle it with him before
building. [Mail on a phone](040-mail-on-a-phone.md) waits on it; Calendar's
phone design, on the Calendar side, does too.

## Inputs

- `frontend/src/platform/pwa/index.ts`: the one Suite PWA. The manifest and the
  iOS install tags sit on every route; the push worker is Mail's FCM worker
  (`src/apps/mail/sw.ts`, built to `sw.js`), registered on sign-in.
- `frontend/vite.config.ts`: VitePWA with `manifest: false`; the webmanifest is
  served by the site.
- Native apps through Capacitor come after this:
  [Mail and Calendar as native apps](048-native-apps.md).
