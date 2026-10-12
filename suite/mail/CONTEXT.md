# Mail

Mail is Suite's email client: each user reads and sends mail for one or more
mail accounts held on the site's JMAP mail server. Its interface is being
rethought at [`wayfinder/mail-ux/MAP.md`](../../wayfinder/mail-ux/MAP.md).

## Language

**All accounts**:
The view that merges one folder (Inbox, Sent, Starred…) across every mail
account the user has, each item still belonging to its own account.
_Avoid_: All Inboxes, Unified inbox, Combined inbox

**Category**:
A kind of mail the Inbox is split into by what it is: Primary, Updates,
Forums, Promotions or Social. Each person picks which categories get a tab of
their own; mail of a category without one stays in Primary. A person can put
a sender in a category, and that sender's mail, old and new, follows.
_Avoid_: Label, Bundle, Smart folder, Tab (the tab is how a category shows)

**Primary**:
The category that is the Inbox's own: mail that needs you. It holds
everything in the Inbox that isn't in another category the person has turned
on, including mail not sorted yet.
_Avoid_: Important, Focused, Imbox
