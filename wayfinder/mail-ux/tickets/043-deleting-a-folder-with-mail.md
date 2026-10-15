---
id: 043
title: Deleting a folder with mail in it
label: wayfinder:grilling
status: open
assignee:
blocked-by: []
---

## Question

Deleting a folder destroys the mail that is only in it: `delete_mailboxes`
passes `onDestroyRemoveEmails=True`, so that mail is gone for good, not put in
Trash, with no Undo. Mail also filed elsewhere just loses the folder, and
your sent mail is always kept in Sent, so the dialog's "Mails in this folder
will be permanently removed" overstates it. Most people delete a folder to
tidy the sidebar, not to destroy its mail. Decide what happens to that mail
(Archive, Trash, refuse while the folder holds mail, or delete as now) and
what the dialog says. Nested folders go with their parent, so the answer
covers them too.

Proposed in [Folders, labels, or both](004-folders-and-labels.md): move mail
that's only in the folder to Archive, reword the dialog ("Its mail moves to
Archive"), and leave emptying it into Trash first for anyone who wants the
mail gone. Left for later by the user on 2026-10-15.

Source: graduated from [Folders, labels, or both](004-folders-and-labels.md).
Inputs: `DeleteFolderModal.vue`, `delete_mailbox` in `suite/mail/api/mail.py`,
`delete_mailboxes` in `suite/mail/doctype/mailbox/mailbox.py`.
