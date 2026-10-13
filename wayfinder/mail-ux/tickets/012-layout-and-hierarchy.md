---
id: 012
title: Layout, hierarchy and use of space
label: wayfinder:grilling
status: closed
assignee: claude (agent, 2026-10-12), with Akash
blocked-by: [001]
---

## Question

Mail's screen doesn't use its space well, and what matters doesn't stand
out. Pin the underlying problem per region: the shell's rail and panel, the
folder sidebar, the list (row density, what a row shows, toolbar), the
reading pane (header, actions, banners, width of the message), and compose,
on desktop sizes from a laptop to a wide monitor and on a phone. Decide the
hierarchy: what is always visible, what is one click away, what is hidden,
and how the regions share space (split view, full width, resizable panes).
It has to sit inside the unified shell's rail, panel and content pane
([unified-frontend](../../unified-frontend/MAP.md), ticket 010). Expect a
prototype ticket to follow once the problems are pinned.

Source: the user's pain list (2026-10-09).

## Inputs

From [merged problems](../references/merged-problems.md) (ticket 003):
- C04 The screen doesn't use its space well (A04, A05, A06, A86, A89, I24).
- C08 A row doesn't describe its thread: which message represents a thread
  in each view (I02).
- C10 Thread menus overlap and mix routine, risky and technical items (A24,
  A25, A33).
- C29 Compose covers the mail you're answering (A38, I14).
- C40 No context on who you're writing to: a sender pane (G13).

## Answer

Resolved 2026-10-13 with Akash, for the list: its header, toolbar, rows and
date headers, on desktop. Decided by trying variants in the running app (the
design doc "Inbox Header Hierarchy Variations", then one change at a time)
and built in frappe/suite#984. The other regions (the reading pane, compose,
the sidebar and the shell) and the rest of C04, C08, C10, C29 and C40 move to
[Layout of the thread, compose and sidebar](038-thread-compose-and-sidebar-layout.md).

**The problem, for the list.** Too many stacked bars before the mail (title,
tabs, toolbar), controls that read the same as folders, and rows and headers
taller than they need to be.

- **Header:** in a split Inbox the category tabs stand in the title bar in
  place of the "Inbox" title, which they make redundant; every other folder
  keeps its title. Underline tabs, scrolling sideways with a fade where they
  don't fit. This replaces [A clean inbox](010-a-clean-inbox.md)'s tab row
  between the header and the toolbar. Every tab counts its unread threads,
  Primary included (99+ past 99), and the sidebar's Inbox count is the whole
  Inbox.
- **View menu:** one icon beside Compose holds how the list is laid out:
  Split view, Group by date and Categories as switches, and in a split
  Inbox a switch per category tab.
- **Toolbar (48px):** the select-all checkbox always shows, on the left.
  Filters are pills (All, Unread, Starred, Has attachments, Unknown sender),
  `sm`, `rounded-4`, the selected one a grey fill, so a filter never reads as
  a folder. Where they don't all fit (split view on a laptop) they fold into
  one selector, a funnel, "All mail" and a chevron, its title naming the
  filter ("Unread", or "Unread +1" for several). The phone keeps its Filter
  sheet. Refresh at the right end. No loading line: an empty list shows a
  spinner in its place while it loads.
- **Rows:** full width 40px. In split view, 8px above and below and 2px
  between sender, subject and preview. The unread dot stays before the
  sender. Attachment pills are tighter.
- **Date headers:** a quiet tinted row, 36px, the label as written ("Today",
  not capitals), with the day's checkbox (its hitbox inside the header) and
  the fold's chevron; the whole row folds the group and fills on hover. A
  selected day takes the rows' blue.
- **Grouping:** one switch, Group by date (View menu and Settings), in place
  of None / Day / Month. Groups get coarser going back: a day each this week,
  a week each for the three weeks before, then a month each. A month the
  weeks took the end of reads "Earlier in September" ("Earlier this month"
  for this one). Groups are keyed by their dates, so a fold survives
  midnight. Stored as `group_by_date`, a check in User Settings; a patch
  turned it on for anyone grouping by day or month.

Tried and dropped: the tab row of 010; variants 1a, 1b and 1d; frappe-ui's
boxed and pill tab styles in the header; pills scrolling sideways in split
view (too busy); the narrow selector drawn as a pill, or as "All" alone;
"Filtered · 2" and "2 filters"; a Group by submenu with a Month option; a 40px
toolbar and thread header; a 16px column edge, a 16px checkbox gap and the
unread dot hung in the gap; a darker blue for a selected date header;
capitals in date headers.

