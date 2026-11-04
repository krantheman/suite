---
id: 048
title: Native apps
label: wayfinder:grilling
status: open
assignee:
blocked-by: [040]
---

## Question

Once each product is an app of its own on a phone (PWAs, see
[Every app as its own phone app](047-every-app-as-its-own-phone-app.md)),
wrap them as native apps through Capacitor. Decide: native push (APNs and FCM in place of the
web push relay), store listings and review, deep links and universal links,
the share sheet and attachments from other apps, background refresh, and how a
native shell signs in and keeps its session.

A PWA built well carries over to Capacitor largely as it is; what is new here
is the native half.

## Decisions so far

- 2026-11-04, the user: **polish the PWA, then wrap it in Capacitor, the way
  Raven does for its native app.** This replaces the earlier "if and when the
  PWAs fall short": native is now the plan, and the polish comes first. For Mail
  that polish is [Mail on a phone](040-mail-on-a-phone.md), which this waits on.

## Inputs

- Raven's setup (frappe/raven): the Capacitor app is `apps/native`, with its
  config in `capacitor.config.ts`, beside the web app in `apps/web`, whose
  `src/native/auth.ts` holds its native sign-in.
