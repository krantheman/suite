<template>
	<!-- The phone's answer to the desktop detail column. Same component inside —
	     RSVP, participants, the ⋯ menu — hosted in a sheet rather than a column,
	     so it opens over the agenda instead of taking the width the agenda needs.
	     The sheet caps itself at 90dvh and scrolls, which is what the design's
	     "drag up for the rest" amounts to. -->
	<BottomSheet :open="!!calendarEvent" @update:open="(open) => !open && emit('close')">
		<EventDetailSidebar
			v-if="calendarEvent"
			:key="calendarEvent.id + (calendarEvent.recurrence_id ?? '')"
			:calendar-event="calendarEvent"
			variant="sheet"
			@close="emit('close')"
			@edit="emit('edit')"
			@reload-events="emit('reloadEvents')"
			@email-participants="(emails: string[]) => emit('emailParticipants', emails)"
		/>
	</BottomSheet>
</template>

<script setup lang="ts">
import { BottomSheet } from 'frappe-ui'

import EventDetailSidebar from '@/apps/calendar/components/EventDetailSidebar.vue'

defineProps<{ calendarEvent: any | null }>()

const emit = defineEmits<{
	close: []
	edit: []
	reloadEvents: []
	emailParticipants: [emails: string[]]
}>()
</script>
