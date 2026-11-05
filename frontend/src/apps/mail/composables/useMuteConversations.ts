import { api, client } from '@/api'
import type { Thread } from '@/apps/mail/types'
import { raiseOptimisticToast } from '@/apps/mail/utils'
import { useUndo } from '@/apps/mail/utils/composables'

/** What a list does when conversations are muted or unmuted on it. */
export interface MuteView {
  /** The account a row belongs to: the list's own, or each row's where a list spans accounts. */
  accountOf: (thread: Thread) => string
  /** Takes off the list the rows muting takes out of it, returning them for Undo. */
  takeOff: (threads: Thread[]) => Thread[]
  /** Puts rows back on the list, for an Undo or a mute that failed. */
  putBack: (rows: Thread[]) => void
  /** Reads the list and its counts again. */
  refresh: () => void
}

const setRowsMuted = (threads: Thread[], muted: 0 | 1) =>
  threads.forEach((thread) => {
    thread.muted = muted
    thread.messages?.forEach((message) => (message.muted = muted))
  })

/**
 * Muting and unmuting, the same in every list: one account's, All accounts' and the open thread's.
 * A muted conversation leaves the Inbox, so Undo takes it back and marks unread what muting read.
 * Unmuting a conversation brings it back to the Inbox, as that is where its replies now go.
 */
export const useMuteConversations = (view: MuteView) => {
  const { setUndoAction, undo } = useUndo()

  const perAccount = <T>(
    threads: Thread[],
    request: (account: string, threadIds: string[]) => Promise<T>,
  ) => {
    const byAccount = new Map<string, string[]>()
    threads.forEach((thread) => {
      const account = view.accountOf(thread)
      byAccount.set(account, [...(byAccount.get(account) ?? []), thread.thread_id])
    })
    return Promise.all([...byAccount].map(([account, ids]) => request(account, ids)))
  }

  const mute = (threads: Thread[]) => {
    if (!threads.length) return
    setUndoAction(undefined)
    setRowsMuted(threads, 1)
    const removed = view.takeOff(threads)
    const answers = new Map<string, { thread_ids: string[]; left: boolean; read: string[] }>()
    const forward = perAccount(threads, async (account, thread_ids) => {
      const result = await client.mutation(api.mail.messages.mute, {
        account,
        thread_ids,
        muted: true,
      })
      answers.set(account, { thread_ids, left: result.left_inbox, read: result.marked_read })
    }).then(
      () => view.refresh(),
      (error) => {
        setRowsMuted(threads, 0)
        view.putBack(removed)
        setUndoAction(undefined)
        throw error
      },
    )
    setUndoAction(
      () =>
        void (async () => {
          await forward.catch(() => {})
          if (!answers.size) return
          setUndoAction(undefined)
          setRowsMuted(threads, 0)
          view.putBack(removed)
          const restore = Promise.all(
            [...answers].map(([account, { thread_ids, left, read }]) =>
              client.mutation(api.mail.messages.mute, {
                account,
                thread_ids,
                muted: false,
                back_to_inbox: left,
                mark_unread: read,
              }),
            ),
          ).then(() => view.refresh())
          raiseOptimisticToast(restore, __('Conversation unmuted.'))
        })(),
    )
    raiseOptimisticToast(
      forward,
      threads.length > 1 ? __('Conversations muted.') : __('Conversation muted.'),
      undo,
    )
  }

  const unmute = (threads: Thread[]) => {
    if (!threads.length) return
    setUndoAction(undefined)
    setRowsMuted(threads, 0)
    raiseOptimisticToast(
      perAccount(threads, (account, thread_ids) =>
        client.mutation(api.mail.messages.mute, {
          account,
          thread_ids,
          muted: false,
          back_to_inbox: true,
        }),
      ).then(
        () => view.refresh(),
        (error) => {
          setRowsMuted(threads, 1)
          throw error
        },
      ),
      threads.length > 1 ? __('Conversations unmuted.') : __('Conversation unmuted.'),
    )
  }

  /** M: mutes what isn't muted yet, or unmutes when everything already is. */
  const toggle = (threads: Thread[]) => {
    if (!threads.length) return
    if (threads.every((thread) => thread.muted)) unmute(threads)
    else mute(threads.filter((thread) => !thread.muted))
  }

  return { mute, unmute, toggle }
}
