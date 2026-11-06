<template>
  <AppSettingsHeader :title="__('Rules')">
    <template #actions>
      <Button icon-left="lucide-plus" :label="__('New')" @click="openRule()" />
    </template>
  </AppSettingsHeader>
  <AppSettingsBody>
    <div class="text-ink-gray-8 space-y-8">
      <Alert
        v-if="pausedBy"
        :title="pausedBy === 'vacation' ? __('Rules are paused') : __('Rules are not running')"
        :description="
          pausedBy === 'vacation'
            ? __('Your vacation response is on. Rules run again once it ends.')
            : __('Your script {0} runs by itself. Save a rule to run both.', [`'${pausedBy}'`])
        "
        theme="amber"
        :dismissable="false"
      />

      <section>
        <div v-if="rules.rules.value.length" class="space-y-0.5">
          <div
            v-for="(rule, i) in rules.rules.value"
            :key="rule.id"
            class="hover:bg-surface-gray-1 -mx-2 flex cursor-pointer items-center gap-3 rounded-4 px-2 py-1.5"
            @click="openRule(rule)"
          >
            <Switch
              :model-value="rule.enabled"
              :aria-label="__('Turn on')"
              class="!p-0"
              @click.stop
              @update:model-value="(on: boolean) => rules.setEnabled(rule.id, on)"
            />
            <div class="min-w-0 flex-1" :class="{ 'opacity-60': !rule.enabled }">
              <div class="text-p-base truncate">{{ rule.name || describe(rule) }}</div>
              <div v-if="rule.name" class="text-p-sm text-ink-gray-5 truncate">
                {{ describe(rule) }}
              </div>
            </div>
            <Dropdown :options="ruleOptions(rule, i)">
              <Button variant="ghost" :tooltip="__('More')" @click.stop>
                <template #icon>
                  <Ellipsis class="text-ink-gray-5 size-4" />
                </template>
              </Button>
            </Dropdown>
          </div>
        </div>
        <div v-else-if="rules.list.data" class="space-y-1">
          <p class="text-p-base font-medium">{{ __('No rules yet') }}</p>
          <p class="text-p-sm text-ink-gray-6">
            {{
              __(
                'Rules sort mail as it arrives: move it to a folder, mark it read, star it or give it a category. Make one here, or from a message’s menu.',
              )
            }}
          </p>
        </div>
      </section>

      <!-- Set on a folder, and changed there: shown here so every rule that sorts mail is on one
           page, in the order they run. -->
      <section v-if="folderRules.length" class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <h2 class="text-base-semibold">{{ __('Folder rules') }}</h2>
            <p class="text-p-sm text-ink-gray-5">
              {{ __('These run after the rules above. Change them in a folder’s settings.') }}
            </p>
          </div>
          <Button :label="__('Folders')" @click="openSettings('mail.folders')" />
        </div>
        <div v-for="rule in folderRules" :key="rule.mailbox_id" class="py-1">
          <div class="text-p-base">{{ rule.folder }}</div>
          <div class="text-p-sm text-ink-gray-5 truncate">{{ describeFolderRule(rule) }}</div>
        </div>
      </section>

      <section class="space-y-3">
        <Button
          variant="ghost"
          :icon-right="showAdvanced ? 'lucide-chevron-up' : 'lucide-chevron-down'"
          :label="__('Advanced')"
          class="-mx-2"
          @click="showAdvanced = !showAdvanced"
        />
        <div v-if="showAdvanced" class="space-y-3">
          <p class="text-p-sm text-ink-gray-6">
            {{
              __(
                'Sieve scripts you write yourself. A script that is on runs after your rules, folder rules and blocked senders, and before the Screener.',
              )
            }}
            <a
              class="text-ink-blue-5 hover:underline"
              href="https://stalw.art/docs/category/sieve-scripting/"
              target="_blank"
            >
              {{ __('Learn more.') }}
            </a>
          </p>
          <div class="flex flex-wrap gap-2">
            <Button icon-left="lucide-plus" :label="__('New Script')" @click="addScript" />
            <Button
              icon-left="lucide-refresh-cw"
              :label="__('Rebuild Automation')"
              :loading="rebuildAutomation.isPending"
              :tooltip="__('Regenerate the automation script from your saved rules.')"
              @click="rebuildAutomationSubmit()"
            />
          </div>
          <div v-if="ownScripts.length" class="space-y-0.5">
            <div
              v-for="script in ownScripts"
              :key="script.name"
              class="hover:bg-surface-gray-1 -mx-2 flex cursor-pointer items-center gap-3 rounded-4 px-2 py-1.5"
              @click="editScript(script)"
            >
              <Switch
                :model-value="!!(script.included || script.active)"
                :aria-label="__('Turn on')"
                class="!p-0"
                @click.stop
                @update:model-value="(on: boolean) => setIncludedSubmit(script, on)"
              />
              <span class="text-p-base min-w-0 flex-1 truncate">{{ script._name }}</span>
              <Badge v-if="script.active" :label="__('Runs by itself')" theme="orange" size="sm" />
              <Dropdown :options="scriptOptions(script)">
                <Button variant="ghost" :tooltip="__('More')" @click.stop>
                  <template #icon>
                    <Ellipsis class="text-ink-gray-5 size-4" />
                  </template>
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>
      </section>
    </div>

    <RuleModal v-model="showRule" :account="store.accountId" :initial="selectedRule" />
    <SieveScriptModal v-model="showSieveScript" :selected-script />
    <DeleteSieveScriptModal
      v-if="selectedScript"
      v-model="showDeleteScript"
      :script="selectedScript"
    />
  </AppSettingsBody>
</template>

<script setup lang="ts">
import { Alert, Badge, Button, Dropdown, Switch } from 'frappe-ui'
import { Ellipsis } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

import { api, useMutation, type InputOf, type OutputOf } from '@/api'
import DeleteSieveScriptModal from '@/apps/mail/components/Modals/DeleteSieveScriptModal.vue'
import RuleModal from '@/apps/mail/components/Modals/RuleModal.vue'
import SieveScriptModal from '@/apps/mail/components/Modals/SieveScriptModal.vue'
import { useRules } from '@/apps/mail/composables/useRules'
import { userStore } from '@/apps/mail/stores/user'
import type { SieveScript } from '@/apps/mail/types'
import { raiseToast } from '@/apps/mail/utils'
import { useSettings } from '@/apps/mail/utils/composables'
import { describeRule, type Rule } from '@/apps/mail/utils/rules'
import AppSettingsBody from '@/components/settings/AppSettingsBody.vue'
import AppSettingsHeader from '@/components/settings/AppSettingsHeader.vue'

type FolderRule = OutputOf<typeof api.mail.rules.list>['folder_rules'][number]

const store = userStore()
const { sieveScripts } = store
const { openSettings } = useSettings()
const rules = useRules(() => store.accountId)
const pausedBy = computed(() => rules.list.data?.paused_by)
const folderRules = computed(() => rules.list.data?.folder_rules ?? [])

const folderName = (id: string) => store.mailboxes.data?.find((m) => m.id === id)?._name
const describe = (rule: Rule) => describeRule(rule, folderName)
const describeFolderRule = (rule: FolderRule) => {
  const when = [
    rule.emails_from && __('from {0}', [rule.emails_from]),
    rule.subject_contains && __('subject contains {0}', [rule.subject_contains]),
  ]
    .filter(Boolean)
    .join(rule.match_if === 'all' ? ` ${__('and')} ` : ` ${__('or')} `)
  const does = [
    __('move here'),
    rule.mark_as_read && __('mark as read'),
    rule.add_star && __('star'),
  ].filter(Boolean)
  return `${when} → ${does.join(', ')}`
}

const showRule = ref(false)
const selectedRule = ref<Rule>()
const openRule = (rule?: Rule) => {
  selectedRule.value = rule
  showRule.value = true
}
const ruleOptions = (rule: Rule, i: number) => [
  { label: __('Edit'), icon: 'lucide-edit-2', onClick: () => openRule(rule) },
  {
    label: __('Move Up'),
    icon: 'lucide-arrow-up',
    onClick: () => rules.move(rule.id, -1),
    condition: () => i > 0,
  },
  {
    label: __('Move Down'),
    icon: 'lucide-arrow-down',
    onClick: () => rules.move(rule.id, 1),
    condition: () => i < rules.rules.value.length - 1,
  },
  {
    label: __('Delete'),
    icon: 'lucide-trash-2',
    theme: 'red' as const,
    onClick: async () => {
      await rules.remove(rule.id)
      raiseToast(__('Rule deleted.'))
    },
  },
]

// Scripts the person wrote: not the automation script, which the rules and folders write, nor the
// read-only ones (the vacation response, and the rules' own script).
const ownScripts = computed(
  () =>
    sieveScripts.data?.filter((s) => !s.read_only && s._name !== 'frappe_mail_automation') ?? [],
)
// Open while there are scripts to show, so a person who wrote one still finds it where it was.
const showAdvanced = ref(false)
watch(
  () => ownScripts.value.length,
  (count) => count && (showAdvanced.value = true),
  { immediate: true },
)

const rebuildAutomation = useMutation(api.mail.sieve.rebuildAutomation)
async function rebuildAutomationSubmit() {
  const input: InputOf<typeof api.mail.sieve.rebuildAutomation> = {
    account: store.accountId,
  }
  await rebuildAutomation.run(input)
  raiseToast(__('Automation rebuilt from your saved rules.'))
}
const setIncluded = useMutation(api.mail.sieve.setIncluded)
async function setIncludedSubmit(script: SieveScript, included: boolean) {
  await setIncluded.run({ account: store.accountId, id: script.id, included })
  raiseToast(
    included ? __("'{0}' turned on.", [script._name]) : __("'{0}' turned off.", [script._name]),
  )
}
const showSieveScript = ref(false)
const selectedScript = ref<SieveScript>()
const showDeleteScript = ref(false)
const addScript = () => {
  selectedScript.value = undefined
  showSieveScript.value = true
}
const editScript = (script: SieveScript) => {
  selectedScript.value = script
  showSieveScript.value = true
}
const scriptOptions = (script: SieveScript) => [
  {
    label: __('Edit'),
    icon: 'lucide-edit-2',
    onClick: () => editScript(script),
  },
  {
    label: __('Delete'),
    icon: 'lucide-trash-2',
    theme: 'red' as const,
    onClick: () => {
      selectedScript.value = script
      showDeleteScript.value = true
    },
    condition: () => !script.active,
  },
]
</script>
