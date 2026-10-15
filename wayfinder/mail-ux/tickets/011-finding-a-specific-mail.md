---
id: 011
title: Finding a specific mail
label: wayfinder:grilling
status: open
assignee:
blocked-by: [001]
---

## Question

Finding one particular mail is hard. Pin where it fails for the user: the
query doesn't match (wrong fields, no attachment text, typos, no operators),
the results are hard to scan or rank badly, the filters are hard to reach,
or the user remembers something search can't use (who, roughly when, "the
one with the PDF"). Then decide the shape of search. Related tickets and
hints: search opening the first result (008), search inside attachments
(009), saved searches (survey G11), and the audit's search findings.
Graduate each piece the answer keeps into its own ticket.

Source: the user's pain list (2026-10-09), marked important.

## Inputs

From [merged problems](../references/merged-problems.md) (ticket 003):
- C27 Finding a specific mail (A49, A50, A52, A53, A54, I21, G11, G12), with
  the facts in [Search inside attachments](009-search-inside-attachments.md).
- **A conversation shows as several rows, all marked at once** (the user,
  2026-10-15). Search lists matching messages, one row each, but keys every
  row by its conversation: four results from one thread are four rows, and
  opening or moving onto one draws the open bar (or the cursor) on all four.
  Either show one row per conversation, with its matching messages inside, or
  key rows by message so only the one you're on is marked — not a row per
  message keyed by thread. The user leans to one row per conversation, which
  [Folders, labels, or both](004-folders-and-labels.md) builds on: actions on
  a result act on the whole conversation. Left to decide here is how a
  conversation row shows which of its messages matched.

## Decisions so far

- 2026-10-15, the user: **search rows are conversations**, one row each, as
  [Folders, labels, or both](004-folders-and-labels.md) decided (actions on a
  result act on the whole conversation). How such a row reads:
  - **It describes the newest matching message**: sender, date and snippet
    come from it, so the snippet holds the highlighted words and the date is
    when the match happened. Not the conversation's newest message, whose
    snippet may not contain the search at all.
  - **Its count is the conversation's message count**, the same grey number
    the list shows. A count of matching messages was weighed and turned down:
    the same-looking number would have meant something else here.
  - **Opening it lands on the newest matching message**, unfolded, with the
    search words highlighted in its body; the rest fold as usual. As opening
    a thread from Drafts lands on the draft.
  - **Its folder tags say where the received mail is** (Inbox, Archive, a
    folder of yours): up to two, then "+N". Sent is left out unless the
    conversation is only your own sent mail, where it is the one answer.
