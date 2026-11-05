import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMuteConversations } from '@/apps/mail/composables/useMuteConversations'
import type { Thread } from '@/apps/mail/types'

const mocks = vi.hoisted(() => ({
  mutation: vi.fn(),
  undoAction: undefined as (() => void) | undefined,
}))

vi.mock('@/api', () => ({
  api: { mail: { messages: { mute: 'mute' } } },
  client: { mutation: mocks.mutation },
}))
vi.mock('@/apps/mail/utils', () => ({
  raiseOptimisticToast: (forward: Promise<unknown>) => void forward.catch(() => {}),
}))
vi.mock('@/apps/mail/utils/composables', () => ({
  useUndo: () => ({
    setUndoAction: (action?: () => void) => (mocks.undoAction = action),
    undo: () => mocks.undoAction?.(),
  }),
}))

const row = (thread_id: string, account = 'acct', muted: 0 | 1 = 0) =>
  ({ thread_id, account, muted }) as unknown as Thread

// A list holding rows, as a page does: muting takes them off, and an Undo or a failure puts them back.
const listOf = (rows: Thread[]) => {
  const list = { rows: [...rows], refresh: vi.fn() }
  const muting = useMuteConversations({
    accountOf: (thread) => thread.account!,
    takeOff: (threads) => {
      list.rows = list.rows.filter((r) => !threads.includes(r))
      return threads
    },
    putBack: (back) => list.rows.push(...back),
    refresh: list.refresh,
  })
  return { list, ...muting }
}

const settled = () => vi.waitFor(() => expect(mocks.mutation).toHaveBeenCalled())
const flush = () => new Promise((resolve) => setTimeout(resolve))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.undoAction = undefined
  vi.stubGlobal('__', (text: string) => text)
  mocks.mutation.mockResolvedValue({ updated: ['m1'], left_inbox: true, marked_read: ['m1'] })
})

describe('muting', () => {
  it('takes the conversation off the list at once, without waiting for the server', () => {
    mocks.mutation.mockReturnValue(new Promise(() => {}))
    const a = row('t1')
    const { list, mute } = listOf([a])

    mute([a])

    expect(list.rows).toEqual([])
    expect(a.muted).toBe(1)
  })

  it('asks each account for its own conversations, in a list spanning accounts', async () => {
    const { mute } = listOf([])

    mute([row('t1', 'one'), row('t2', 'two'), row('t3', 'one')])
    await settled()

    expect(mocks.mutation).toHaveBeenCalledWith('mute', {
      account: 'one',
      thread_ids: ['t1', 't3'],
      muted: true,
    })
    expect(mocks.mutation).toHaveBeenCalledWith('mute', {
      account: 'two',
      thread_ids: ['t2'],
      muted: true,
    })
  })

  it('puts the conversation back as it was when the server refuses', async () => {
    mocks.mutation.mockRejectedValue(new Error('no'))
    const a = row('t1')
    const { list, mute } = listOf([a])

    mute([a])
    await flush()

    expect(list.rows).toEqual([a])
    expect(a.muted).toBe(0)
  })
})

describe('undoing a mute', () => {
  it('returns to the Inbox only if it left, and marks unread only what muting read', async () => {
    mocks.mutation.mockResolvedValueOnce({
      updated: ['m1', 'm2'],
      left_inbox: true,
      marked_read: ['m2'],
    })
    const a = row('t1')
    const { list, mute } = listOf([a])

    mute([a])
    await flush()
    mocks.undoAction!()
    await flush()

    expect(mocks.mutation).toHaveBeenLastCalledWith('mute', {
      account: 'acct',
      thread_ids: ['t1'],
      muted: false,
      back_to_inbox: true,
      mark_unread: ['m2'],
    })
    expect(list.rows).toEqual([a])
    expect(a.muted).toBe(0)
  })

  it('leaves in its folder a conversation that never left the Inbox', async () => {
    mocks.mutation.mockResolvedValueOnce({ updated: ['m1'], left_inbox: false, marked_read: [] })
    const a = row('t1')
    const { mute } = listOf([a])

    mute([a])
    await flush()
    mocks.undoAction!()
    await flush()

    expect(mocks.mutation).toHaveBeenLastCalledWith(
      'mute',
      expect.objectContaining({ muted: false, back_to_inbox: false, mark_unread: [] }),
    )
  })

  it('waits for a mute still on its way, rather than racing it', async () => {
    let answer!: (value: unknown) => void
    mocks.mutation.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)))
    const { mute } = listOf([])

    mute([row('t1')])
    mocks.undoAction!()
    await flush()
    expect(mocks.mutation).toHaveBeenCalledTimes(1)

    answer({ updated: ['m1'], left_inbox: true, marked_read: [] })
    await flush()
    expect(mocks.mutation).toHaveBeenCalledTimes(2)
  })
})

describe('unmuting', () => {
  it('brings the conversation back to the Inbox', async () => {
    const a = row('t1', 'acct', 1)
    const { unmute } = listOf([a])

    unmute([a])
    await settled()

    expect(mocks.mutation).toHaveBeenCalledWith('mute', {
      account: 'acct',
      thread_ids: ['t1'],
      muted: false,
      back_to_inbox: true,
    })
    expect(a.muted).toBe(0)
  })
})

describe('the M key', () => {
  it('mutes only what is not muted yet, in a mixed selection', async () => {
    const { toggle } = listOf([])

    toggle([row('t1', 'acct', 1), row('t2', 'acct', 0)])
    await settled()

    expect(mocks.mutation).toHaveBeenCalledWith(
      'mute',
      expect.objectContaining({ thread_ids: ['t2'], muted: true }),
    )
  })

  it('unmutes when everything selected is muted already', async () => {
    const { toggle } = listOf([])

    toggle([row('t1', 'acct', 1)])
    await settled()

    expect(mocks.mutation).toHaveBeenCalledWith(
      'mute',
      expect.objectContaining({ thread_ids: ['t1'], muted: false }),
    )
  })
})
