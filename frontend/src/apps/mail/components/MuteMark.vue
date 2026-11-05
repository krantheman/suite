<template>
  <Tooltip :text="__('Muted')">
    <span class="inline-flex shrink-0 align-middle outline-none" tabindex="-1">
      <BellOff class="text-ink-gray-5 size-3.5" :aria-label="__('Muted')" />
    </span>
  </Tooltip>
</template>

<script setup lang="ts">
import { Tooltip } from 'frappe-ui'
import { BellOff } from 'lucide-vue-next'
</script>
