---
id: 034
title: Muting a thread
label: wayfinder:grilling
status: open
assignee:
blocked-by: [010]
---

## Question

Reply-all storms and threads a person was only CC'd on keep landing in the
Inbox. Decide what muting a thread means (later replies skip the Inbox,
arrive read, notify or not), how it is undone, how muted threads are found,
and what happens when someone writes to the person directly in a muted
thread.

Source: graduated from [A clean inbox](010-a-clean-inbox.md).

## Inputs

- G05 in [the feature gap survey](../references/feature-gap-survey.md):
  RFC 9979 registers `$muted`; keeping new replies out of the Inbox needs a
  delivery-time step, either Sieve over a list of muted Message-IDs
  (`extlists`, RFC 6134) or Suite's import path moving new thread members.
