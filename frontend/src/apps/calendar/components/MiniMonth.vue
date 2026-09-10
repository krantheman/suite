<template>
	<!-- The month at a glance, on the sidebar's own type scale: nothing louder
	     than 13px. A day wears one tick that widens with how much is on it —
	     a density map rather than a count — today is circled, and clicking a day
	     takes the calendar there. Paging here only turns this card: the calendar
	     itself moves when a day is picked, and the card follows the calendar
	     whenever that changes month.

	     The days are MonthDayCell, the same cell the phone's month draws, so the
	     two cannot drift apart in how they mark today or how they show a day's
	     load. `relative` on each, so the buttons keep painting over the week
	     band behind their row. -->
	<div class="rounded-5 border border-outline-gray-1 bg-surface-elevation-1 p-2">
		<div class="mb-1 flex items-center gap-1.5 px-0.5">
			<span class="text-sm font-medium leading-4 text-ink-gray-9">{{ monthName }}</span>
			<span class="text-sm leading-4 text-ink-gray-4">{{ year }}</span>
			<span class="flex-1" />
			<Button variant="ghost" size="sm" icon="lucide-chevron-left" @click="page(-1)" />
			<Button variant="ghost" size="sm" icon="lucide-chevron-right" @click="page(1)" />
		</div>
		<div class="relative grid grid-cols-7 gap-0.5">
			<span
				v-for="letter in weekdays"
				:key="letter"
				class="pb-1 pt-1 text-center text-xs text-ink-gray-4"
			>
				{{ letter }}
			</span>
			<!-- The week the calendar shows, as a band behind its row. An absolutely
			     positioned grid child takes its box from its grid placement, so the
			     band covers the row exactly without pixel arithmetic — both lines
			     spelled out, since for such a child an `auto` end line means the
			     container's edge. The day buttons are positioned and paint over it. -->
			<span
				v-if="selectedRow != null"
				class="pointer-events-none absolute inset-0 rounded-2 bg-surface-gray-2"
				:style="{ gridRow: `${selectedRow + 2} / ${selectedRow + 3}`, gridColumn: '1 / 8' }"
			/>
			<MonthDayCell
				v-for="day in days"
				:key="day.key"
				:day="day"
				class="relative"
				@select="(picked) => emit('select', picked.date.toDate())"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { Button } from 'frappe-ui'

import MonthDayCell from '@/apps/calendar/components/MonthDayCell.vue'
import { monthDays } from '@/apps/calendar/composables/useMonthGrid'
import { useEventDensity } from '@/apps/calendar/composables/useEventDensity'

const dayjs = inject('$dayjs')

const props = defineProps<{
	/** The month the calendar shows; the card starts here and resyncs when it changes. */
	month: number
	year: number
	/**
	 * Palette colour per calendar id, for the ticks. The events themselves are the
	 * card's own — see useEventDensity — since it is paged independently of the
	 * calendar and has to know about months the main view never fetched.
	 */
	calendarColor: (calendar: string) => string
	/** The day the calendar is on, and which view: Day marks the day, Week its whole row. */
	selected?: Date
	view?: 'Month' | 'Week' | 'Day'
}>()

const emit = defineEmits<{ select: [date: Date] }>()

// The month on the card, which the arrows turn without touching the calendar.
const viewed = ref({ month: props.month, year: props.year })

watch(
	() => [props.month, props.year],
	([month, year]) => (viewed.value = { month, year }),
)

const page = (months: number) => {
	const date = new Date(viewed.value.year, viewed.value.month + months, 1)
	viewed.value = { month: date.getMonth(), year: date.getFullYear() }
}

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const monthName = computed(() => dayjs().month(viewed.value.month).format('MMMM'))
const year = computed(() => viewed.value.year)

const selectedKey = computed(() =>
	props.selected ? dayjs(props.selected).format('YYYY-MM-DD') : '',
)

// The card, the phone's month and the phone's week strip are the same six rows
// of days with the same density on them — only the size they are drawn at
// differs. In Week the calendar's day is not marked here: the band behind its
// row says where it is, and a marked day inside a marked row said it twice.
const { events } = useEventDensity(
	() => viewed.value.month,
	() => viewed.value.year,
	(calendar) => props.calendarColor(calendar),
)

const days = monthDays(
	() => viewed.value.month,
	() => viewed.value.year,
	() => events.value,
	() => (props.view === 'Day' ? selectedKey.value : ''),
)

/** Row of the calendar's week on this card, when the card is showing it. */
const selectedRow = computed(() => {
	if (props.view !== 'Week' || !selectedKey.value) return null
	const index = days.value.findIndex((day) => day.key === selectedKey.value)
	return index < 0 ? null : Math.floor(index / 7)
})
</script>
