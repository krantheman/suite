<template>
  <!-- Clearing the open tab in one go (not Primary, which is cleared a thread at a time): one menu
       holds every way to clear it. Drawn as the toolbar's own buttons are. -->
  <div class="flex items-center">
    <Dropdown :options="menuFor(category)" align="end">
      <Button variant="ghost" :tooltip="__('More')" :aria-label="__('More')">
        <template #icon>
          <span class="lucide-ellipsis icon" aria-hidden="true" />
        </template>
      </Button>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import { Button, Dropdown } from 'frappe-ui'

import {
  useTabClearMenu,
  type ClearTarget,
  type InboxCategory,
} from '@/apps/mail/composables/useInboxTabs'

const { category, target } = defineProps<{ category: InboxCategory; target: ClearTarget }>()

const menuFor = useTabClearMenu(() => target)
</script>
