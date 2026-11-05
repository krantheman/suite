<template>
  <AppSettingsHeader :title="__('Muted Conversations')" />
  <AppSettingsBody>
    <p class="text-p-sm text-ink-gray-6 mb-4">
      {{
        __(
          'Replies to these conversations skip your Inbox and stay read, with no notification. A reply with you in To comes to your Inbox as usual.',
        )
      }}
    </p>
    <div v-if="rows.length" class="flex flex-col">
      <div
        v-for="row in rows"
        :key="row.thread_id"
        class="border-outline-gray-1 flex items-center gap-3 border-b py-2 last:border-b-0"
      >
        <div class="min-w-0 flex-1">
          <div class="text-ink-gray-8 truncate text-base">
            {{ row.subject || __('[No subject]') }}
          </div>
          <div class="text-ink-gray-5 mt-0.5 flex items-center gap-2 text-sm">
            <span class="truncate">{{ row.from_name || row.from_email }}</span>
            <MailDate class="shrink-0" :datetime="row.received_at" format="list" />
          </div>
        </div>
        <Button :label="__('Unmute')" @click="muting.unmute([row])" />
      </div>
      <Button
        v-if="muted.hasNext"
        class="mt-3 self-center"
        variant="ghost"
        :label="__('Load More')"
        :loading="muted.isFetchingNext"
        @click="muted.fetchNext()"
      />
    </div>
    <p v-else-if="!muted.isFetching" class="text-ink-gray-6 text-p-base">
      {{ __('No muted conversations. Mute one from its menu, or press M with it open.') }}
    </p>
  </AppSettingsBody>
</template>

<script setup lang="ts">
import { Button } from 'frappe-ui'
import { computed } from 'vue'

import { api, useInfiniteQuery } from '@/api'
import MailDate from '@/apps/mail/components/MailDate.vue'
import { useMuteConversations } from '@/apps/mail/composables/useMuteConversations'
import { userStore } from '@/apps/mail/stores/user'
import { threadRow } from '@/apps/mail/utils/threadRows'
import AppSettingsBody from '@/components/settings/AppSettingsBody.vue'
import AppSettingsHeader from '@/components/settings/AppSettingsHeader.vue'

const store = userStore()

const muted = useInfiniteQuery(api.mail.threads.list, () => ({
  account: store.accountId,
  mailbox: 'muted',
  limit: 50,
  start: 0,
}))
// Paged by row count, which a reaction-only row still counts towards (see get_threads).
const rows = computed(() =>
  muted.rows.filter((row) => !row.reaction_only).map((row) => threadRow(row, store.accountId)),
)

// Unmuting takes the row out by reading the list again.
const muting = useMuteConversations({
  accountOf: () => store.accountId,
  takeOff: () => [],
  putBack: () => {},
  refresh: () => void muted.refetch().catch(() => {}),
})
</script>
