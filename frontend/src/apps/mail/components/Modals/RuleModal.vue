<template>
  <Dialog v-model:open="show" :title="editing ? __('Edit Rule') : __('New Rule')" size="2xl">
    <template #default>
      <div class="text-ink-gray-8 space-y-5">
        <FormControl
          v-model="rule.name"
          :label="__('Name')"
          :placeholder="__('Optional, to find it again')"
        />

        <section class="space-y-2">
          <div class="text-p-base flex flex-wrap items-center gap-2">
            <template v-if="rule.conditions.length > 1">
              <span>{{ __('When mail arrives that matches') }}</span>
              <Select v-model="rule.match" :options="MATCH_OPTIONS" class="w-20" />
              <span>{{ __('of these') }}</span>
            </template>
            <span v-else>{{ __('When mail arrives where') }}</span>
          </div>
          <!-- On a phone the field and its comparison share a line, and what is typed takes the
               next, so none of the three is squeezed. -->
          <div
            v-for="(condition, i) in rule.conditions"
            :key="i"
            class="grid grid-cols-2 gap-2 sm:flex sm:items-center"
          >
            <Select
              :model-value="condition.field"
              :options="FIELD_OPTIONS"
              class="sm:w-36 sm:shrink-0"
              @update:model-value="(field) => setField(i, field as ConditionField)"
            />
            <Select
              :model-value="comparisonOf(condition).value"
              :options="comparisonOptions(condition)"
              class="sm:w-48 sm:shrink-0"
              @update:model-value="(value) => setComparison(i, String(value))"
            />
            <div class="col-span-2 flex min-w-0 flex-1 items-center gap-2">
              <FormControl
                v-model="condition.value"
                :type="condition.field === 'size' ? 'number' : 'text'"
                :placeholder="fieldOf(condition.field).placeholder()"
                class="min-w-0 flex-1"
              />
              <Button
                variant="ghost"
                icon="lucide-x"
                :tooltip="__('Remove')"
                :disabled="rule.conditions.length === 1"
                @click="rule.conditions.splice(i, 1)"
              />
            </div>
          </div>
          <Button
            variant="subtle"
            icon-left="lucide-plus"
            :label="__('Add Condition')"
            @click="rule.conditions.push(conditionOn('from'))"
          />
        </section>

        <section class="space-y-2">
          <div class="text-p-base">{{ __('Do this') }}</div>
          <div
            v-for="(action, i) in rule.actions"
            :key="action.type"
            class="flex flex-wrap items-center gap-2 sm:flex-nowrap"
          >
            <Select
              :model-value="action.type"
              :options="actionOptions(action)"
              class="w-full sm:w-48 sm:shrink-0"
              @update:model-value="(type) => (rule.actions[i] = { type: type as ActionType })"
            />
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <Select
                v-if="action.type === 'move'"
                v-model="action.value"
                :options="folderOptions"
                :placeholder="__('Choose a folder')"
                class="min-w-0 flex-1"
              />
              <Select
                v-else-if="action.type === 'category'"
                v-model="action.value"
                :options="CATEGORY_OPTIONS"
                :placeholder="__('Choose a category')"
                class="min-w-0 flex-1"
              />
              <div v-else class="flex-1" />
              <Button
                variant="ghost"
                icon="lucide-x"
                :tooltip="__('Remove')"
                @click="rule.actions.splice(i, 1)"
              />
            </div>
          </div>
          <Dropdown v-if="addableActions.length" :options="addableActions">
            <Button variant="subtle" icon-left="lucide-plus" :label="__('Add Action')" />
          </Dropdown>
        </section>

        <!-- What the conditions match in mail already received: the rule itself leaves that mail
             where it is, so this is to check the conditions, not a list of what will move. -->
        <section class="bg-surface-gray-1 space-y-2 rounded-lg p-3">
          <p class="text-p-sm text-ink-gray-6">
            {{ __('Rules act on mail as it arrives. Mail you already have stays where it is.') }}
          </p>
          <template v-if="previewable">
            <p v-if="preview.data" class="text-p-base">
              {{
                preview.data.total
                  ? __('{0} messages you have now match these conditions.', [preview.data.total])
                  : __('No mail you have now matches these conditions.')
              }}
            </p>
            <p v-else-if="preview.isFetching" class="text-p-base text-ink-gray-5">
              {{ __('Looking for matching mail…') }}
            </p>
            <ul v-if="preview.data?.rows.length" class="divide-outline-gray-1 divide-y">
              <li
                v-for="row in preview.data.rows"
                :key="row.id"
                class="text-p-sm flex items-baseline gap-2 py-1.5"
              >
                <span class="w-32 shrink-0 truncate font-medium max-sm:w-24">
                  {{ row.from_name || row.from_email }}
                </span>
                <span class="min-w-0 flex-1 truncate">{{ row.subject || __('(No subject)') }}</span>
                <span class="text-ink-gray-5 shrink-0">{{
                  dayjs(row.received_at).format('D MMM')
                }}</span>
              </li>
            </ul>
          </template>
          <p v-else class="text-p-base text-ink-gray-5">
            {{ __('Fill in the conditions to see which mail they match.') }}
          </p>
        </section>
      </div>
    </template>
    <template #actions>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <Button
          v-if="editing"
          theme="red"
          variant="subtle"
          :label="__('Delete')"
          class="mr-auto"
          @click="deleteRule"
        />
        <span v-if="problem" class="text-p-sm text-ink-gray-5">{{ problem }}</span>
        <Button
          variant="solid"
          :label="__('Save')"
          :disabled="!!problem"
          :loading="rules.saving.value"
          @click="saveRule"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { Button, Dialog, Dropdown, FormControl, Select } from 'frappe-ui'
import { computed, ref, toRaw, watch } from 'vue'

import { api, useQuery } from '@/api'
import { useRules } from '@/apps/mail/composables/useRules'
import { raiseToast } from '@/apps/mail/utils'
import dayjs from '@/apps/mail/utils/dayjs'
import {
  ACTIONS,
  blankRule,
  CATEGORIES,
  comparisonOf,
  conditionOn,
  fieldOf,
  FIELDS,
  ruleProblem,
  type ActionType,
  type ConditionField,
  type Rule,
  type RuleAction,
  type RuleCondition,
} from '@/apps/mail/utils/rules'

const show = defineModel<boolean>()
const { account, initial } = defineProps<{
  account: string
  /** The rule to edit, or a draft to finish; a blank rule when left out. */
  initial?: Rule
}>()

const rules = useRules(() => account)
const rule = ref<Rule>(blankRule())
const editing = computed(
  () => !!rule.value.id && rules.rules.value.some((r) => r.id === rule.value.id),
)
watch(
  show,
  (open) => {
    if (open) rule.value = structuredClone(toRaw(initial) ?? blankRule())
  },
  { immediate: true },
)

const MATCH_OPTIONS = [
  { label: __('all'), value: 'all' },
  { label: __('any'), value: 'any' },
]
const FIELD_OPTIONS = FIELDS.map((f) => ({ label: f.label(), value: f.value }))
const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ label: c.label(), value: c.value }))
const comparisonOptions = (condition: RuleCondition) =>
  fieldOf(condition.field).comparisons.map((c) => ({ label: c.label(), value: c.value }))

const setField = (i: number, field: ConditionField) =>
  (rule.value.conditions[i] = conditionOn(field, rule.value.conditions[i].value))
const setComparison = (i: number, value: string) => {
  const condition = rule.value.conditions[i]
  const chosen = fieldOf(condition.field).comparisons.find((c) => c.value === value)!
  rule.value.conditions[i] = { ...condition, op: chosen.op, negate: chosen.negate || undefined }
}

// Moving, archiving and trashing each put the mail somewhere, so a rule does one of them at most;
// and each action once.
const files = (type: ActionType) => ACTIONS.find((a) => a.value === type)!.files
const allowed = (type: ActionType, besides?: RuleAction) => {
  const others = rule.value.actions.filter((a) => a !== besides)
  return !others.some((a) => a.type === type || (files(type) && files(a.type)))
}
const actionOptions = (action: RuleAction) =>
  ACTIONS.filter((a) => allowed(a.value, action)).map((a) => ({ label: a.label(), value: a.value }))
const addableActions = computed(() =>
  ACTIONS.filter((a) => allowed(a.value)).map((a) => ({
    label: a.label(),
    onClick: () => rule.value.actions.push({ type: a.value }),
  })),
)

// Folders a rule can move mail to: the person's own. Archive and Trash are actions of their own, and
// the rest are filled by sending, writing or junking.
const mailboxes = useQuery(api.mail.mailboxes.list, () => (account ? { account } : false))
const folderOptions = computed(() =>
  (mailboxes.data ?? []).filter((m) => !m.role).map((m) => ({ label: m._name, value: m.id })),
)

const problem = computed(() => ruleProblem(rule.value))

// The preview asks for the conditions alone, once typing settles.
const conditions = computed(() =>
  rule.value.conditions.some((c) => !c.value.trim()) ||
  ruleProblem({ ...rule.value, actions: [{ type: 'mark_read' }] })
    ? ''
    : JSON.stringify({ match: rule.value.match, conditions: rule.value.conditions }),
)
const settled = refDebounced(conditions, 400)
const previewable = computed(() => !!conditions.value)
const preview = useQuery(api.mail.rules.preview, () =>
  show.value && settled.value && account
    ? { account, rule: { ...blankRule(), ...JSON.parse(settled.value), actions: [] } }
    : false,
)

const saveRule = async () => {
  const saved = await rules.put(rule.value)
  raiseToast(
    saved?.paused_by === 'vacation'
      ? __('Rule saved. Rules run again once your vacation response ends.')
      : __('Rule saved.'),
  )
  show.value = false
}
const deleteRule = async () => {
  await rules.remove(rule.value.id)
  raiseToast(__('Rule deleted.'))
  show.value = false
}
</script>
