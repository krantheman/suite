---
id: 049
title: Phone loose ends from the Mail app work
label: wayfinder:grilling
status: open
assignee:
blocked-by: []
---

## Question

Three things a phone gets wrong, found while checking Mail as an app of its own
([Every app as its own phone app](047-every-app-as-its-own-phone-app.md)) in
the iOS Simulator on 2026-10-21. Each is small; decide what each should do.

- **An empty folder loses its title.** With nothing in a folder, the list's
  whole header is replaced by "You have no mails in this folder.": the title
  row with ☰ and the folder's name goes with it, so there is no saying where
  you are and no way to the folders but the bottom bar. The empty state should
  sit under the title, not in place of it.
- **Profile lists other apps' settings.** Mail's Profile page shows the whole
  Suite settings list, Drive's Statistics and External access among them. In
  Mail as an app of its own, should it list only the account's settings and
  Mail's, and where do the rest go?
- **"All accounts" is not named on the list.** With every account showing at
  once, the title still reads "Inbox"; only the "in <account>" tag on each row
  says the list is merged. Since the account switcher moved to Profile there is
  nothing on the list itself that says it. Decide whether the title says so
  ("All inboxes") or something else does.

## Inputs

- Empty folder: `frontend/src/apps/mail/pages/MailboxView.vue`, the "No mails"
  branch (`v-else`) that replaces the list and its mobile header block.
- Profile: `frontend/src/components/MobileProfilePage.vue` renders
  `SettingsList` with every group from `useSettingsGroups`; Calendar's Profile
  uses the same page.
- All accounts: the account switcher left the phone's folders sheet for
  Profile (PR frappe/suite#1039); the merged list is `UnifiedFolderView.vue`,
  titled by the open folder.
- Related: [Mail on a phone](040-mail-on-a-phone.md) gathers the rest of the
  phone's questions.
