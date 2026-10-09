---
id: 014
title: How others handle unknown senders
label: wayfinder:research
status: closed
assignee: claude (agent, 2026-10-09)
blocked-by: []
---

## Question

How do HEY, Gmail, Apple Mail, Fastmail, Superhuman, Spark and Outlook deal
with mail from people you've never heard from, and what does each get wrong?
Cover the mechanism (screener, gatekeeper, categories, focused inbox, block
lists, contact allow-lists, sender verification), what happens to the mail
while undecided, how a decision is reversed, what happens to mail already
received, how first contact from someone important is protected, and the
documented criticism of each (HEY's Screener in particular: users and
reviewers on what breaks, such as missed receipts, password resets,
colleagues, and decision fatigue). Findings go in
`references/unknown-senders-elsewhere.md`.

## Answer

Resolved 2026-10-09 by a research agent:
[references/unknown-senders-elsewhere.md](../references/unknown-senders-elsewhere.md).

Only HEY and Spark hold back first contact by default; Fastmail and Outlook
can with a rule, and Gmail, Apple Mail and Superhuman sort by classifier
instead. Classifiers lose first contact too, since a new sender has no
history. HEY's own changelog shows the friction (a way to clear 100+
waiting senders, Screen in & Reply, a spam button added later); reviewers
report strangers never notify so mail waits for days, screening is a chore
when little spam arrives, No feels permanent, and password resets come from
unscreened addresses. Only Apple documents a sender decision reaching
existing mail by default. In Suite: people you write to are accepted,
admins can add global accepted rules, screening is off by default except on
personal accounts, and unscreened mail sends no push notification. The file
ends with eight candidate root problems and where each product stands.
