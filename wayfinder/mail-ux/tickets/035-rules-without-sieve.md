---
id: 035
title: Sorting mail without writing Sieve
label: wayfinder:grilling
status: open
assignee:
blocked-by: [010]
---

## Question

The only general way to tell Mail where a kind of mail goes is raw Sieve
(Settings, Automation); folders have a few sender rules of their own. Decide
what a person can express without Sieve (conditions, actions), where rules
are made (from a message, from settings), how they relate to the per-sender
category choice decided in [A clean inbox](010-a-clean-inbox.md), and what
happens to hand-written Sieve.

Source: graduated from [A clean inbox](010-a-clean-inbox.md).

## Inputs

- C03 in [merged problems](../references/merged-problems.md) (G10, A75).
- G10 in [the feature gap survey](../references/feature-gap-survey.md):
  Gmail's "filter messages like these", Fastmail's "add rule from message";
  Suite can generate Sieve and store it through JMAP for Sieve (RFC 9661).
- Today: `AutomationSettings.vue` (raw scripts) and `FolderModal.vue`
  (emails from, subject contains, mark read or star, file into the folder).
