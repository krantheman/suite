import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRules } from '@/apps/mail/composables/useRules'
import type { Rule } from '@/apps/mail/utils/rules'

const mocks = vi.hoisted(() => ({ run: vi.fn(), data: undefined as { rules: Rule[] } | undefined }))

vi.mock('@/api', () => ({
  api: { mail: { rules: { list: 'list', save: 'save' } } },
  useQuery: () => ({
    get data() {
      return mocks.data
    },
  }),
  useMutation: () => ({ run: mocks.run, isPending: false }),
}))

const rule = (id: string, enabled = true): Rule => ({
  id,
  name: id,
  enabled,
  match: 'all',
  conditions: [{ field: 'from', op: 'is', value: `${id}@example.org` }],
  actions: [{ type: 'archive' }],
})

// The ids of the list the last change wrote, in order.
const written = () => (mocks.run.mock.lastCall?.[0].rules as Rule[]).map((r) => r.id)

beforeEach(() => {
  vi.clearAllMocks()
  mocks.data = { rules: [rule('a'), rule('b'), rule('c')] }
})

describe('changing the rules', () => {
  it('saves a new rule after the others, and an edited one in its place', () => {
    const { put } = useRules('acct')

    put(rule('d'))
    expect(written()).toEqual(['a', 'b', 'c', 'd'])

    put({ ...rule('b'), name: 'renamed' })
    expect(written()).toEqual(['a', 'b', 'c'])
    expect(mocks.run.mock.lastCall?.[0].rules[1].name).toBe('renamed')
    expect(mocks.run.mock.lastCall?.[0].account).toBe('acct')
  })

  it('moves a rule along the order they run in', () => {
    const { move } = useRules('acct')

    move('c', -1)
    expect(written()).toEqual(['a', 'c', 'b'])

    move('a', 1)
    expect(written()).toEqual(['b', 'a', 'c'])
  })

  it('writes nothing when a rule is already at the end it is moved toward', () => {
    const { move } = useRules('acct')

    move('a', -1)
    move('c', 1)

    expect(mocks.run).not.toHaveBeenCalled()
  })

  it('switches a rule off without dropping it, and deletes only the one asked', () => {
    const { setEnabled, remove } = useRules('acct')

    setEnabled('b', false)
    expect(mocks.run.mock.lastCall?.[0].rules.map((r: Rule) => r.enabled)).toEqual([
      true,
      false,
      true,
    ])

    remove('b')
    expect(written()).toEqual(['a', 'c'])
  })
})
