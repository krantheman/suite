import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { api, useMutation, useQuery } from '@/api'
import type { Rule } from '@/apps/mail/utils/rules'

/**
 * An account's rules, and the changes a person makes to them. The server keeps them as one list,
 * in the order they run, so every change writes the list back whole; a refused save leaves the
 * list as it was.
 */
export const useRules = (account: MaybeRefOrGetter<string>) => {
  const list = useQuery(api.mail.rules.list, () =>
    toValue(account) ? { account: toValue(account) } : false,
  )
  const save = useMutation(api.mail.rules.save)
  const rules = computed<Rule[]>(() => list.data?.rules ?? [])

  const write = (next: Rule[]) => save.run({ account: toValue(account), rules: next })

  /** Saves a rule: in its place when it has one, after the others when it is new. */
  const put = (rule: Rule) =>
    write(
      rule.id && rules.value.some((r) => r.id === rule.id)
        ? rules.value.map((r) => (r.id === rule.id ? rule : r))
        : [...rules.value, rule],
    )

  const remove = (id: string) => write(rules.value.filter((r) => r.id !== id))

  const setEnabled = (id: string, enabled: boolean) =>
    write(rules.value.map((r) => (r.id === id ? { ...r, enabled } : r)))

  /** Moves a rule up (-1) or down (+1) the order they run in. */
  const move = (id: string, by: -1 | 1) => {
    const next = [...rules.value]
    const from = next.findIndex((r) => r.id === id)
    const to = from + by
    if (from < 0 || to < 0 || to >= next.length) return Promise.resolve()
    next.splice(to, 0, ...next.splice(from, 1))
    return write(next)
  }

  return { list, rules, saving: computed(() => save.isPending), put, remove, setEnabled, move }
}
