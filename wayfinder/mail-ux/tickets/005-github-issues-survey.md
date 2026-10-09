---
id: 005
title: Mail problems reported on GitHub
label: wayfinder:research
status: closed
assignee: claude (agent, 2026-10-09)
blocked-by: []
---

## Question

What Mail UX problems have users and the team reported on GitHub? Read the
Mail issues on frappe/suite (label `mail` and any open or recently closed
issue that touches Mail), and the closed issues on the archived frappe/mail
repo that still apply. Group them by the underlying problem, not by the fix
each issue proposes: several issues often share one cause, and the fix an
issue suggests is a hint, not the answer. For each group: the problem in one
line, the issues behind it (linked), whether it still happens today, and how
often users would hit it. Findings go in `references/github-issues.md`.

## Answer

Resolved 2026-10-09 by a research agent, read-only on GitHub. Findings:
[references/github-issues.md](../references/github-issues.md). 134 issues
kept (54 on frappe/suite, 80 on frappe/mail) in 29 problem groups, I01 to
I29; I25 to I29 are already fixed.

Most pressing problems: a list row mixes facts from different messages so it
misdescribes its thread (I02); a verdict on a sender doesn't reach their
existing mail (I19); new mail reaches the list late (I01); what you write
isn't exactly what recipients get (I12); drafts can lose work (I13); dark
mode makes some mail unreadable (I08); bursts of automated mail flood the
list (I04); range selection misbehaves (I03); some HTML mail renders wrong
(I07); attaching from Drive and refused file types (I17); notifications open
the wrong place (I22); no print (I10). Several issues propose fixes that miss
the root cause (I01, I02, I03, I12, I13, I19).
