<template>
  <Tooltip v-if="muteRowMark === 'icon'" :text="__('Muted')">
    <span class="inline-flex shrink-0 align-middle outline-none" tabindex="-1">
      <BellOff class="text-ink-gray-5 size-3.5" :aria-label="__('Muted')" />
    </span>
  </Tooltip>
  <Badge v-else-if="muteRowMark === 'label'" size="sm" :label="__('Muted')" />
</template>

<script setup lang="ts">
import { Badge, Tooltip } from 'frappe-ui'
import { BellOff } from 'lucide-vue-next'

import { muteRowMark } from '@/apps/mail/tweaks/muteRowMark'
</script>
