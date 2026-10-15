---
id: 041
title: The top of the sidebar and the account switcher
label: wayfinder:grilling
status: open
assignee:
blocked-by: []
---

## Question

Before the first folder, the sidebar spends two rows: the title "Mail", then
a row for the account with a generic person icon, the address, and an
up-and-down chevron. The account row is drawn like a folder row, so it reads
as one more place to go rather than as the account everything below belongs
to, and the pair takes space the folders could use.

Decide what the top of the sidebar holds and how much room it takes:
- whether the title and the account become one row;
- what names the account (a name, the address, an avatar);
- what its menu offers (the accounts, All accounts, Settings, signing out);
- how it reads with one account, with several, on the collapsed rail and on
  a phone.

It should match the rest of the sidebar as rebuilt in
[Layout of the thread, compose and sidebar](038-thread-compose-and-sidebar-layout.md).

[Which account a mail belongs to and goes out from](018-which-account.md)
decides how account identity shows across Mail, including counts in the
switcher. This ticket is the switcher's place, look and room; agree the two.

Source: the user, 2026-10-15. Inputs: the sidebar's account row and menu as
of that date (`AppSidebar.vue`, `accountMenu`), and C21 in
[merged problems](../references/merged-problems.md).
