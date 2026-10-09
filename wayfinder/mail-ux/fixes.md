# Mail UX: obvious fixes

Problems whose right answer isn't in doubt, so they skip the map's decision
tickets and can ship now. Decided in
[The user's pain list](tickets/003-pain-list.md) (2026-10-09). Each group
below is meant to ship as one PR; ids point into
[references/merged-problems.md](references/merged-problems.md) (C-ids) and
its sources: A-ids in the heuristic audit, I-ids in the GitHub issues, G-ids
in the feature gap survey. Fix the underlying problem, not each finding
separately. If a fix turns out to need a real choice, move it to a ticket.

## Daily friction

- [ ] **All accounts works like a single account's list** (C12; A02, A03,
  A32, A56): checkboxes and select-all, the unknown-sender marker, the
  subject in the tab title, Outbox and New Folder. One shared list, not two.
- [ ] **Mail looks as the sender sent it** (C13; A27, I07, I08): wide HTML
  fits the pane, a regression set of real messages for rendering, and a way
  to show a message as sent when dark mode spoils it.
- [ ] **The list keeps up with the server** (C14; I01): new mail and changes
  made elsewhere arrive without waiting for the poll; draft edits reach the
  list while the editor is open.
- [ ] **Selection and keyboard focus** (C15; I03, A12, A83, A84): range
  selection keeps its anchor, a day click shows in the toolbar, Esc clears
  the selection before closing the thread, no key lost after the shortcuts
  modal.
- [ ] **Controls can be named and hit** (C16; A08, A39, A87): accessible
  names on icon buttons, and phone touch targets of at least 44 px.
- [ ] **Nothing fixed covers content on phones** (C17; A62, A88, I23):
  toasts, the compose button and the selection bar stay in the layout's
  flow.
- [ ] **Small list glitches** (C18; A15, A16, A17, A19, A48): attachment
  chip names, the open-row accent, the title link, Trash's bare spinner,
  draft rows' red badge.

## Trust and safety

- [ ] **Harder to pick the wrong recipient** (C25; A42): suggestions show the
  address clearly, tell apart the same name at two domains, and don't cover
  Subject.
- [ ] **Destructive actions say what they destroy** (C24; A18, A44, A70,
  A92): counts and permanence in confirms, Discard away from Send, risky
  toggles and Log out set apart.
- [ ] **Toasts and Undo arrive with the action** (C26; A63).

## Compose and search

- [ ] **Compose keeps its controls in view** (C31; A40, A41, A45, A47): Cc
  and Bcc, schedule send and Attach reachable; a click inside compose never
  collapses it or lands on the list.
- [ ] **What you write is what recipients get** (C32; I12): one pipeline for
  the editor and the sent HTML; quoted styles don't bleed; images go as
  attachments, not base64.
- [ ] **Attach from Drive, and say why a file is refused** (C33; I17).

## New features with an obvious shape

- [ ] **Reactions** (C44; I09, G17): send and show RFC 9078 reactions. A
  prototype is stashed on `feat/mail-reactions`.
- [ ] **Print and save as PDF** (C45; I10, G23).
- [ ] **Create an event from a mail** (C46; I11), prefilled.

## Settings

- [ ] **Settings show clean data** (C50; A73, A74, A76, A79): no internal
  ids, no stale vacation defaults, named push devices, a Screener table that
  fits.

## Verify, then close

- [ ] **Mail to yourself** (I20): probably not reproducible; the delivered
  copy reaches the Inbox. Check once and close the issue if so.
