import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  blankRule,
  comparisonOf,
  conditionOn,
  describeRule,
  ruleProblem,
  type Rule,
} from '@/apps/mail/utils/rules'

vi.mock('@/api', () => ({ api: {} }))

beforeEach(() => {
  vi.stubGlobal('__', (text: string, args: string[] = []) =>
    text.replace(/\{(\d+)\}/g, (_, i) => args[Number(i)]),
  )
})

const rule = (overrides: Partial<Rule>): Rule => ({ ...blankRule(), ...overrides })

describe('a condition', () => {
  it('reads a negated operator back as the comparison said the other way round', () => {
    expect(comparisonOf({ field: 'from', op: 'contains', value: 'x', negate: true }).label()).toBe(
      "doesn't contain",
    )
    expect(comparisonOf({ field: 'from', op: 'domain', value: 'x' }).label()).toBe(
      'is from the domain',
    )
  })

  it('keeps what was typed when its field changes, unless a size cannot use it', () => {
    expect(conditionOn('subject', 'invoice').value).toBe('invoice')
    expect(conditionOn('size', 'invoice').value).toBe('')
    expect(conditionOn('size', '500').value).toBe('500')
  })
})

describe('a rule that cannot be saved yet', () => {
  it('says what is missing', () => {
    expect(ruleProblem(blankRule())).toBe('Fill in every condition.')
    expect(ruleProblem(rule({ conditions: [] }))).toBe('Add a condition.')

    const from = [{ field: 'from' as const, op: 'is' as const, value: 'a@example.org' }]
    expect(ruleProblem(rule({ conditions: from }))).toBe('Add something for the rule to do.')
    expect(ruleProblem(rule({ conditions: from, actions: [{ type: 'move' }] }))).toBe(
      'Choose where to move the mail.',
    )
    expect(ruleProblem(rule({ conditions: from, actions: [{ type: 'category' }] }))).toBe(
      'Choose a category.',
    )
    expect(
      ruleProblem(
        rule({
          conditions: [{ field: 'size', op: 'over', value: '0' }],
          actions: [{ type: 'star' }],
        }),
      ),
    ).toBe('Give the size in KB.')
    expect(ruleProblem(rule({ conditions: from, actions: [{ type: 'archive' }] }))).toBeNull()
  })
})

describe('a rule in a line', () => {
  it('says when it acts and what it does, naming the folder', () => {
    const line = describeRule(
      rule({
        match: 'any',
        conditions: [
          { field: 'from', op: 'is', value: 'billing@example.org' },
          { field: 'size', op: 'over', value: '500' },
        ],
        actions: [
          { type: 'move', value: 'f1' },
          { type: 'category', value: 'updates' },
        ],
      }),
      (id) => (id === 'f1' ? 'Invoices' : undefined),
    )

    expect(line).toBe(
      'From is billing@example.org or Size is over 500 KB → move to Invoices, set category Updates',
    )
  })

  it('still reads when its folder has gone', () => {
    const line = describeRule(
      rule({
        conditions: [{ field: 'subject', op: 'contains', value: 'report' }],
        actions: [{ type: 'move', value: 'deleted' }, { type: 'mark_read' }],
      }),
      () => undefined,
    )

    expect(line).toBe('Subject contains report → move to a folder, mark as read')
  })
})
