<template>
  <!-- PROTOTYPE: the Tweak panel switching where the menu that clears a tab sits. Dev builds only. -->
  <div
    v-if="isDev"
    class="fixed bottom-20 right-3 z-[60] w-96 rounded-6 border border-outline-gray-1 bg-surface-elevation-2 text-ink-gray-8 shadow-2xl sm:bottom-5 sm:right-5"
  >
    <div class="flex items-center gap-2 py-2 pl-3 pr-1.5">
      <span class="lucide-sliders-horizontal size-4 text-ink-gray-6" aria-hidden="true" />
      <span class="flex-1 text-sm-medium">{{ __('Clearing a tab') }}</span>
      <Button
        variant="ghost"
        :icon="open ? 'lucide-chevron-down' : 'lucide-chevron-up'"
        :aria-label="open ? 'Collapse' : 'Expand'"
        @click="open = !open"
      />
    </div>
    <div v-if="open" class="space-y-1.5 border-t border-outline-gray-1 p-3">
      <p class="text-sm text-ink-gray-5">{{ __('Where its menu sits') }}</p>
      <TabButtons
        fluid
        :options="[...PLACEMENTS]"
        :model-value="placement"
        @update:model-value="(value) => setPlacement(value as Placement)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button, TabButtons } from 'frappe-ui'
import { ref } from 'vue'

import {
  placement,
  PLACEMENTS,
  setPlacement,
  type Placement,
} from '@/apps/mail/prototype/clearMenuPlacement'

const isDev = import.meta.env.DEV
const open = ref(true)
</script>
