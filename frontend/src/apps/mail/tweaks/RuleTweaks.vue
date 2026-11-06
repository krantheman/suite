<template>
  <!-- Inside the dialog rather than fixed to the page: a modal dialog takes no clicks outside it. -->
  <div class="border-outline-gray-3 ml-auto w-56 rounded-lg border border-dashed p-3">
    <div class="text-ink-gray-8 mb-2 text-sm font-medium">{{ __('Tweak: rule layout') }}</div>
    <div class="flex gap-1">
      <Button
        v-for="layout in LAYOUTS"
        :key="layout.value"
        :label="layout.label"
        :variant="ruleLayout === layout.value ? 'solid' : 'subtle'"
        @click="ruleLayout = layout.value"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from 'frappe-ui'

import { ruleLayout, type RuleLayout } from '@/apps/mail/tweaks/ruleLayout'

const LAYOUTS: { label: string; value: RuleLayout }[] = [
  { label: 'Sentence', value: 'sentence' },
  { label: 'Stacked', value: 'stacked' },
]
</script>
