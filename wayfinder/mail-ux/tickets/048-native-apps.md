---
id: 048
title: Mail and Calendar as native apps
label: wayfinder:grilling
status: open
assignee:
blocked-by: [047]
---

## Question

Once Mail and Calendar are apps of their own on a phone (PWAs, see
[Mail and Calendar as their own phone apps](047-mail-and-calendar-as-their-own-apps.md)),
wrap them as native apps through Capacitor, if and when the PWAs fall short.
Decide when it is worth it, and then: native push (APNs and FCM in place of the
web push relay), store listings and review, deep links and universal links,
the share sheet and attachments from other apps, background refresh, and how a
native shell signs in and keeps its session.

Parked by the user on 2026-10-19: native can come later, if needed. A PWA built
well carries over to Capacitor largely as it is; what is new here is the
native half.
