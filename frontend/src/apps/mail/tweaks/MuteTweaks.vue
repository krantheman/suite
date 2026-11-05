<template>
  <Teleport to="body">
    <div
      class="bg-surface-white border-outline-gray-2 fixed bottom-4 right-4 z-50 max-sm:bottom-20 w-56 rounded-lg border p-3 shadow-lg"
    >
      <div class="text-ink-gray-8 mb-2 text-sm font-medium">{{ __('Tweak: muted row') }}</div>
      <div class="flex gap-1">
        <Button
          v-for="mark in MARKS"
          :key="mark.value"
          :label="mark.label"
          :variant="muteRowMark === mark.value ? 'solid' : 'subtle'"
          @click="muteRowMark = mark.value"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Button } from 'frappe-ui'

import { muteRowMark, type MuteRowMark } from '@/apps/mail/tweaks/muteRowMark'

const MARKS: { label: string; value: MuteRowMark }[] = [
  { label: 'Icon', value: 'icon' },
  { label: 'Label', value: 'label' },
  { label: 'None', value: 'none' },
]
</script>
