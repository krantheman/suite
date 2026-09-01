<template>
	<!-- The week the agenda opens on, pinned under the title. Its job is
	     orientation, not navigation of the list: tapping a day moves the agenda
	     to it. Each day carries the same density marks the month grid uses, at
	     the smallest size they still read at — one dot per calendar with
	     something on the day. -->
	<div class="grid grid-cols-7 border-b px-2.5 pb-2">
		<button
			v-for="day in days"
			:key="day.key"
			type="button"
			class="flex flex-col items-center gap-1 rounded-3 py-1.5"
			:class="!day.inMonth && 'opacity-60'"
			:aria-current="day.isSelected ? 'date' : undefined"
			@click="emit('select', day.key)"
		>
			<span class="text-ink-gray-5 text-[10px] uppercase tracking-[0.06em]">
				{{ day.date.format('ddd') }}
			</span>
			<span
				class="flex size-7 items-center justify-center rounded-full text-base font-medium"
				:class="
					day.isToday
						? 'bg-surface-gray-10 text-ink-gray-1'
						: day.isSelected
							? 'bg-surface-gray-3 text-ink-gray-9'
							: 'text-ink-gray-8'
				"
			>
				{{ day.date.date() }}
			</span>
			<!-- Always laid out, so the numerals sit on one line whether or not the
			     day has anything on it. -->
			<span class="flex h-1 items-center gap-0.5">
				<span
					v-for="color in day.colors"
					:key="color"
					class="size-1 rounded-full"
					:style="{ backgroundColor: paletteColor(color) }"
				/>
			</span>
		</button>
	</div>
</template>

<script setup lang="ts">
import { CalendarColorMap } from 'frappe-ui/experimental'

import { weekDays } from '@/apps/calendar/composables/useMonthGrid'

import type { GridEvent } from '@/apps/calendar/composables/useMonthGrid'

const props = defineProps<{
	/** Any day of the week to show. */
	anchor: string
	/** The day the agenda is on. */
	selected: string
	events: GridEvent[]
}>()

const emit = defineEmits<{ select: [date: string] }>()

const days = weekDays(
	() => props.anchor,
	() => props.events,
	() => props.selected,
)

const paletteColor = (color: string) =>
	CalendarColorMap[color]?.color || CalendarColorMap.green.color
</script>
