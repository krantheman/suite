---
id: 009
title: Search inside attachments
label: wayfinder:research
status: closed
assignee: claude (agent, 2026-10-09)
blocked-by: []
---

## Question

Can a search find words inside attachments (PDFs first, then Office files)?
Find out what Stalwart indexes today (JMAP `text` and `body` filters, its
full-text index and any attachment text extraction), what turning it on
would cost (index size, CPU, which formats), and how a match in an
attachment would show in the results. Findings go in
`references/attachment-search.md`.

Source: the user's pain list (2026-10-09).

## Answer

Resolved 2026-10-09 by a research agent:
[references/attachment-search.md](../references/attachment-search.md).

Stalwart indexes text-type attachments (plain text, CSV, calendar, HTML)
and attached mail, and its `text` filter searches them, so Suite already
finds those. It skips PDF, Word, Excel and PowerPoint, with no setting or
backend to change that, and doesn't index filenames. Searching inside PDFs
needs Stalwart to extract their text (or an extraction service it calls).
Suite never asks for search snippets, so a match never shows why it matched.
Options for ticket 011: show snippets; a `body:` operator; get PDF and
Office extraction into Stalwart; an extraction service; or a separate index
in Suite (not recommended). The agent leans to snippets plus extraction in
Stalwart.
