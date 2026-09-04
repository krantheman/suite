<template>
	<div class="flex flex-col px-3 pb-4">
		<template v-for="section in sections" :key="section.date">
			<div class="text-ink-gray-4 px-1 pb-1 pt-2.5 text-[10.5px] uppercase tracking-[0.06em]">
				{{ section.label }}
			</div>

			<template v-for="(event, index) in section.events" :key="eventKey(event)">
				<!-- The now-line goes between two rows, so it is drawn as one of them. -->
				<div
					v-if="index === markerIndex(section)"
					class="flex items-center gap-2 px-2.5 py-0.5"
					aria-hidden="true"
				>
					<span class="bg-surface-red-5 size-2 shrink-0 rounded-full" />
					<span class="text-ink-red-4 text-[10px] font-medium tabular-nums">
						{{ nowLabel }}
					</span>
					<span class="bg-surface-red-5 h-px flex-1 opacity-70" />
				</div>

				<button
					type="button"
					class="flex items-baseline gap-2.5 rounded-4 px-2.5 py-2 text-left"
					:class="
						rowKey(event, section.date) === openRowKey
							? 'bg-surface-gray-2'
							: 'active:bg-surface-gray-1'
					"
					@click="emit('select', event, section.date)"
				>
					<!-- One line, always: "9 am – 5 pm" wrapped at text-xs in a 60px column
					     and split the range across two lines. 11px is below the type
					     scale's floor (text-xs is 12), so it is spelled out along with the
					     0.02em the scale's own tokens would have carried. -->
					<span
						class="text-ink-gray-5 min-w-16 shrink-0 whitespace-nowrap text-right text-[11px] leading-5 tracking-[0.02em] tabular-nums"
					>
						{{ formatAgendaTime(event) }}
					</span>
					<span
						class="w-0.5 shrink-0 self-stretch rounded-full"
						:style="{ backgroundColor: paletteColor(event.color) }"
					/>
					<span class="min-w-0 flex-1">
						<span
							class="text-ink-gray-8 block truncate text-sm font-medium leading-5"
							:class="event.isDeclined && 'line-through'"
						>
							{{ event.title }}
						</span>
						<span
							v-if="eventDescription(event)"
							class="text-ink-gray-5 mt-0.5 block truncate text-xs leading-4"
						>
							{{ eventDescription(event) }}
						</span>
					</span>
				</button>
			</template>
		</template>

		<!-- A day with nothing on it is worth saying out loud; the alternative is a
		     blank screen that reads as a failure to load. -->
		<div v-if="!sections.length" class="text-ink-gray-4 px-2.5 py-10 text-center text-sm">
			{{ emptyLabel }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CalendarColorMap } from 'frappe-ui/experimental'

import dayjs from '@/apps/calendar/utils/dayjs'
import { formatAgendaTime, nowMarkerIndex } from '@/apps/calendar/utils/agenda'
import { eventDescription } from '@/apps/calendar/utils/eventMeta'

import type { AgendaEvent, AgendaSection } from '@/apps/calendar/utils/agenda'

const props = defineProps<{
	sections: AgendaSection[]
	/** Ticks so the now-line keeps up; the caller owns the clock. */
	now: Date
	/** The event whose sheet is open, if any. */
	openEvent?: AgendaEvent | null
	/** The row that opened it, as `rowKey` spells it — see openRowKey. */
	openRow?: string
	emptyLabel?: string
}>()

const emit = defineEmits<{ select: [event: AgendaEvent, date: string] }>()

const emptyLabel = computed(() => props.emptyLabel ?? __('Nothing scheduled'))

const eventKey = (event: AgendaEvent) => event.id + (event.recurrence_id ?? '')

// An event that runs over several days has a row on each of them, so a row is
// identified by its day as well as its event. Keying the open state on the event
// alone lit up every row a multi-day event has, when only one of them was tapped.
const rowKey = (event: AgendaEvent, date: string) => `${eventKey(event)}@${date}`

const openRowKey = computed(() => {
	if (props.openRow) return props.openRow
	if (!props.openEvent) return ''

	// Arrived by link rather than by tap — nothing was pressed, so the event's
	// first row stands for it, and only that one.
	for (const section of props.sections)
		for (const event of section.events)
			if (eventKey(event) === eventKey(props.openEvent)) return rowKey(event, section.date)
	return ''
})

const markerIndex = (section: AgendaSection) => nowMarkerIndex(section, dayjs(props.now))

const nowLabel = computed(() => dayjs(props.now).format('h:mm'))

const paletteColor = (color?: string) =>
	CalendarColorMap[color ?? '']?.color || CalendarColorMap.green.color

</script>
