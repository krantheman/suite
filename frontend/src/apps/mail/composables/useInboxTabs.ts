import { computed, shallowRef } from 'vue'
import { useRoute, type RouteLocationNamedRaw } from 'vue-router'

import { api, client, type InputOf } from '@/api'
import { userStore } from '@/apps/mail/stores/user'
import { raiseOptimisticToast, raiseToast } from '@/apps/mail/utils'
import { useSettings, useUndo } from '@/apps/mail/utils/composables'

export type InboxCategory = 'primary' | 'updates' | 'forums' | 'promotions' | 'social'

export interface InboxTab {
  category: InboxCategory
  label: string
  icon: string
  /** Threads in the tab with unread mail. */
  unread: number
}

const TAB_LOOK: Record<InboxCategory, { label: () => string; icon: string }> = {
  primary: { label: () => __('Primary'), icon: 'lucide-inbox' },
  updates: { label: () => __('Updates'), icon: 'lucide-bell' },
  forums: { label: () => __('Forums'), icon: 'lucide-messages-square' },
  promotions: { label: () => __('Promotions'), icon: 'lucide-tag' },
  social: { label: () => __('Social'), icon: 'lucide-users' },
}

/**
 * The category tabs over an Inbox: an account's (`'account'`), or every account's at once
 * (`'unified'`), or none (`false`) for any other list. Which categories have a tab is the server's
 * answer (`inbox_tabs`); none means the Inbox isn't split. The open tab is the route's `category`,
 * Primary when it names none of them, and `undefined` when there are no tabs.
 *
 * `listRoute` is the list the tabs belong to: a tab leads there, leaving any open thread behind,
 * since that thread may not be in the tab being opened.
 */
export const useInboxTabs = (
  scope: () => 'account' | 'unified' | false,
  listRoute: () => RouteLocationNamedRaw,
) => {
  const route = useRoute()
  const store = userStore()

  const tabs = computed<InboxTab[]>(() => {
    const where = scope()
    if (!where) return []
    const counts = (where === 'unified' ? store.unifiedTabCounts.data : store.tabCounts.data) ?? []
    return store.inboxTabs.map((category) => ({
      category,
      label: TAB_LOOK[category].label(),
      icon: TAB_LOOK[category].icon,
      unread: counts.find((count) => count.category === category)?.unread_threads ?? 0,
    }))
  })

  const active = computed<InboxCategory | undefined>(() => {
    if (!tabs.value.length) return undefined
    return tabs.value.find((tab) => tab.category === route.query.category)?.category ?? 'primary'
  })

  const routeFor = (category: InboxCategory): RouteLocationNamedRaw => ({
    ...listRoute(),
    query: category === 'primary' ? {} : { category },
  })

  return { tabs, active, routeFor }
}

/** The categories a person can give a tab or not: all but Primary, which is the Inbox's own. */
const CHOOSABLE: InboxCategory[] = ['updates', 'forums', 'promotions', 'social']

// The choice on its way to the server, ahead of the user info that will confirm it. A switch flipped
// while another save is pending builds on it, rather than on the choice from before both (and so
// undoing the first). Shared by every place the choice is made. Shallow, so a save can tell its own
// choice from a later one by identity.
const pendingTabs = shallowRef<InboxCategory[] | null>(null)

/**
 * The person's categories: offered when the site sorts mail into them at all; whether their Inbox is
 * split into them; and which have a tab when it is, a choice kept while the split is off. At least
 * one is always on: turning the split off is the way to one list.
 */
export const useTabChoice = () => {
  const store = userStore()
  // Not a component's mutation: turning categories off takes the tab row, and its menu, away before
  // the save is answered, and a component's mutation is cancelled when the component goes.
  const save = (input: InputOf<typeof api.mail.settings.updatePreferences>) =>
    client.mutation(api.mail.settings.updatePreferences, input)
  const { openSettings } = useSettings()
  const { setUndoAction, undo } = useUndo()

  const offered = computed(() => !!store.userResource.data?.email_classification)
  const split = computed(() => !!store.userResource.data?.split_inbox)
  const chosen = computed(() => pendingTabs.value ?? store.userResource.data?.inbox_tabs ?? [])
  const choices = computed(() =>
    CHOOSABLE.map((category) => ({
      category,
      label: TAB_LOOK[category].label(),
      icon: TAB_LOOK[category].icon,
      on: chosen.value.includes(category),
    })),
  )

  /** Which categories have a tab (Primary leads them). */
  const tabsFor = (categories: InboxCategory[]): InboxCategory[] => {
    const on = CHOOSABLE.filter((category) => categories.includes(category))
    return on.length ? ['primary', ...on] : []
  }
  const saveTabs = async (categories: InboxCategory[]) => {
    const tabs = tabsFor(categories)
    pendingTabs.value = tabs
    try {
      await save({ inbox_tabs: tabs })
    } finally {
      // A later switch's choice stays pending until its own save lands.
      if (pendingTabs.value === tabs) pendingTabs.value = null
    }
  }
  const setTab = (category: InboxCategory, on: boolean) =>
    saveTabs(
      choices.value
        .filter((choice) => (choice.category === category ? on : choice.on))
        .map((choice) => choice.category),
    )

  const setSplit = async (on: boolean) => {
    await save({ split_inbox: on ? 1 : 0 })
    if (on) return
    // Off takes the tabs, and their menu with them: say how to get them back. Undo is Mail's one undo
    // slot, so the toast's button and Cmd/Ctrl+Z do the same, even after the toast has gone.
    setUndoAction(() => raiseOptimisticToast(save({ split_inbox: 1 }), __('Categories turned on.')))
    raiseToast(
      __('Categories turned off.'),
      'success',
      { label: __('Undo'), onClick: undo },
      undefined,
      { label: __('Settings'), onClick: () => openSettings('mail.layout') },
    )
  }

  return {
    offered,
    split,
    choices,
    tabsFor,
    setTab,
    setSplit,
  }
}

/** Where a tab is being cleared: an account's Inbox, or every account's (`folder`). */
export type ClearTarget = { account: string; mailbox: string } | { folder: string }

type Clearing = 'read' | 'archive' | 'trash'

/** The routes a clearing goes through: for one account's Inbox, and for every account's. */
const clearingRoutes = (clearing: Clearing) =>
  (
    ({
      read: [api.mail.messages.markTabRead, api.mail.messages.markUnifiedTabRead],
      archive: [api.mail.messages.archiveTab, api.mail.messages.archiveUnifiedTab],
      trash: [api.mail.messages.trashTab, api.mail.messages.trashUnifiedTab],
    }) as const
  )[clearing]

/**
 * Clearing a tab other than Primary in one go, on the server: every unread message in it marked read,
 * or every message archived or moved to Trash. Each says so with Undo (its
 * toast's button or Cmd/Ctrl+Z), which puts back exactly what it changed and says so once it has.
 */
export const useClearTab = (target: () => ClearTarget) => {
  const name = (category: InboxCategory) => TAB_LOOK[category].label()
  const { setUndoAction, undo } = useUndo()

  /** What a clearing changed, by account and the mailbox it came from; the empty left out. */
  const clear = async (clearing: Clearing, category: InboxCategory) => {
    const where = target()
    const [ofAccount, ofEvery] = clearingRoutes(clearing)
    const done =
      'folder' in where
        ? await client.mutation(ofEvery, { folder: where.folder, category })
        : [
            {
              account: where.account,
              mailbox: where.mailbox,
              ids: await client.mutation(ofAccount, {
                account: where.account,
                mailbox: where.mailbox,
                category,
              }),
            },
          ]
    return done.filter((mail) => mail.ids.length)
  }

  const offerUndo = (message: string, undone: string, putBack: () => Promise<unknown>[]) => {
    setUndoAction(() => raiseOptimisticToast(Promise.all(putBack()), undone))
    raiseToast(message, 'success', { label: __('Undo'), onClick: undo })
  }

  const markAllRead = async (category: InboxCategory) => {
    const done = await clear('read', category)
    if (!done.length) return raiseToast(__('Nothing unread in {0}.', [name(category)]))
    offerUndo(
      __('Everything in {0} marked as read.', [name(category)]),
      __('{0} mail marked as unread.', [name(category)]),
      () =>
        done.map((mail) =>
          client.mutation(api.mail.messages.seen, {
            account: mail.account,
            ids: mail.ids,
            seen: false,
          }),
        ),
    )
  }

  /** Archives or trashes the tab's mail; Undo moves it back to the mailbox it came from. */
  const moveAll = async (clearing: 'archive' | 'trash', category: InboxCategory) => {
    const done = await clear(clearing, category)
    if (!done.length) return raiseToast(__('Nothing in {0}.', [name(category)]))
    offerUndo(
      clearing === 'archive'
        ? __('Everything in {0} archived.', [name(category)])
        : __('Everything in {0} moved to Trash.', [name(category)]),
      __('{0} mail moved back to the Inbox.', [name(category)]),
      () =>
        done.map((mail) =>
          client.mutation(api.mail.messages.move, {
            account: mail.account,
            ids: mail.ids,
            mailbox: mail.mailbox,
          }),
        ),
    )
  }

  const archiveAll = (category: InboxCategory) => moveAll('archive', category)

  const trashAll = (category: InboxCategory) => moveAll('trash', category)

  return { markAllRead, archiveAll, trashAll }
}

/**
 * The menu that clears a tab, wherever it is placed: each action names the tab it acts on, so it
 * can't be read as acting on a selection, and Trash sits apart from the two that keep the mail.
 */
export const useTabClearMenu = (target: () => ClearTarget) => {
  const { markAllRead, archiveAll, trashAll } = useClearTab(target)
  return (category: InboxCategory) => {
    const name = TAB_LOOK[category].label()
    return [
      {
        group: '',
        options: [
          {
            label: __('Mark all in {0} as read', [name]),
            icon: 'lucide-mail-open',
            onClick: () => void markAllRead(category),
          },
          {
            label: __('Archive all in {0}', [name]),
            icon: 'lucide-archive',
            onClick: () => void archiveAll(category),
          },
        ],
      },
      {
        group: '',
        options: [
          {
            label: __('Move all in {0} to Trash', [name]),
            icon: 'lucide-trash-2',
            onClick: () => void trashAll(category),
          },
        ],
      },
    ]
  }
}
