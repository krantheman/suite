import { api, type InputOf } from '@/api'

/** A rule as the server keeps it (see suite/mail/rules.py). */
export type Rule = InputOf<typeof api.mail.rules.save>['rules'][number]
export type RuleCondition = Rule['conditions'][number]
export type RuleAction = Rule['actions'][number]
export type ConditionField = RuleCondition['field']
export type ActionType = RuleAction['type']

/** What a condition's menu offers: the server's operator, said either way round. */
export interface Comparison {
  value: string
  label: () => string
  op: RuleCondition['op']
  negate: boolean
}

const comparison = (op: RuleCondition['op'], negate: boolean, label: () => string): Comparison => ({
  value: `${negate ? '!' : ''}${op}`,
  label,
  op,
  negate,
})

const ADDRESS = [
  comparison('is', false, () => __('is')),
  comparison('is', true, () => __('is not')),
  comparison('contains', false, () => __('contains')),
  comparison('contains', true, () => __("doesn't contain")),
  comparison('domain', false, () => __('is from the domain')),
  comparison('domain', true, () => __('is not from the domain')),
]
const TEXT = [
  comparison('contains', false, () => __('contains')),
  comparison('contains', true, () => __("doesn't contain")),
  comparison('is', false, () => __('is')),
  comparison('is', true, () => __('is not')),
]

export const FIELDS: {
  value: ConditionField
  label: () => string
  comparisons: Comparison[]
  placeholder: () => string
}[] = [
  {
    value: 'from',
    label: () => __('From'),
    comparisons: ADDRESS,
    placeholder: () => 'name@example.com',
  },
  {
    value: 'to',
    label: () => __('To'),
    comparisons: ADDRESS,
    placeholder: () => 'name@example.com',
  },
  {
    value: 'cc',
    label: () => __('Cc'),
    comparisons: ADDRESS,
    placeholder: () => 'name@example.com',
  },
  {
    value: 'to_or_cc',
    label: () => __('To or Cc'),
    comparisons: ADDRESS,
    placeholder: () => 'name@example.com',
  },
  {
    value: 'subject',
    label: () => __('Subject'),
    comparisons: TEXT,
    placeholder: () => __('Words'),
  },
  { value: 'body', label: () => __('Message'), comparisons: TEXT, placeholder: () => __('Words') },
  {
    value: 'list_id',
    label: () => __('Mailing list'),
    comparisons: TEXT,
    placeholder: () => 'list.example.com',
  },
  {
    value: 'size',
    label: () => __('Size'),
    comparisons: [comparison('over', false, () => __('is over'))],
    placeholder: () => __('KB'),
  },
]

export const ACTIONS: { value: ActionType; label: () => string; files: boolean }[] = [
  { value: 'move', label: () => __('Move to folder'), files: true },
  { value: 'archive', label: () => __('Archive'), files: true },
  { value: 'trash', label: () => __('Move to Trash'), files: true },
  { value: 'mark_read', label: () => __('Mark as read'), files: false },
  { value: 'star', label: () => __('Star'), files: false },
  { value: 'category', label: () => __('Set category'), files: false },
]

export const CATEGORIES: { value: string; label: () => string }[] = [
  { value: 'primary', label: () => __('Primary') },
  { value: 'updates', label: () => __('Updates') },
  { value: 'forums', label: () => __('Forums') },
  { value: 'promotions', label: () => __('Promotions') },
  { value: 'social', label: () => __('Social') },
]

export const fieldOf = (field: ConditionField) => FIELDS.find((f) => f.value === field)!

export const comparisonOf = (condition: RuleCondition) =>
  fieldOf(condition.field).comparisons.find(
    (c) => c.op === condition.op && c.negate === !!condition.negate,
  ) ?? fieldOf(condition.field).comparisons[0]

/** A condition on `field`, its first comparison, keeping what was typed where it still fits. */
export const conditionOn = (field: ConditionField, value = ''): RuleCondition => {
  const first = fieldOf(field).comparisons[0]
  return { field, op: first.op, value: field === 'size' && !/^\d+$/.test(value) ? '' : value }
}

/** A new rule: one condition on the sender to fill in, and nothing to do yet. */
export const blankRule = (): Rule => ({
  id: '',
  name: '',
  enabled: true,
  match: 'all',
  conditions: [conditionOn('from')],
  actions: [],
})

/** Why a rule can't be saved yet, or null when it can. */
export const ruleProblem = (rule: Rule): string | null => {
  if (!rule.conditions.length) return __('Add a condition.')
  if (rule.conditions.some((c) => !c.value.trim())) return __('Fill in every condition.')
  if (rule.conditions.some((c) => c.field === 'size' && !/^[1-9]\d*$/.test(c.value.trim())))
    return __('Give the size in KB.')
  if (!rule.actions.length) return __('Add something for the rule to do.')
  if (rule.actions.some((a) => a.type === 'move' && !a.value))
    return __('Choose where to move the mail.')
  if (rule.actions.some((a) => a.type === 'category' && !a.value)) return __('Choose a category.')
  return null
}

/** The rule in a line: when it acts and what it does. */
export const describeRule = (rule: Rule, folderName: (id: string) => string | undefined) => {
  const when = rule.conditions
    .map(
      (c) =>
        `${fieldOf(c.field).label()} ${comparisonOf(c).label()} ${c.value}${c.field === 'size' ? ' KB' : ''}`,
    )
    .join(rule.match === 'any' ? ` ${__('or')} ` : ` ${__('and')} `)
  const does = rule.actions
    .map((a) => {
      if (a.type === 'move') return __('move to {0}', [folderName(a.value ?? '') ?? __('a folder')])
      if (a.type === 'category')
        return __('set category {0}', [
          CATEGORIES.find((c) => c.value === a.value)?.label() ?? a.value,
        ])
      return ACTIONS.find((x) => x.value === a.type)!
        .label()
        .toLowerCase()
    })
    .join(', ')
  return `${when} → ${does}`
}
