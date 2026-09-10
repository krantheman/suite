<template>
	<!--
		One day of a month grid: its number, and under that a tick for how much is
		on it.

		The same cell in the sidebar's card and on the phone's month, because it is
		the same thing being asked in both — which day, and how busy. Drawn twice it
		drifted: the phone marked today with a filled circle round the numeral and
		kept the calendar colours under it, the card filled the whole cell and had
		to recolour the tick to survive its own dark ground. The circle is the one
		that reads, and one cell is the only way it stays that way.
	-->
	<!-- 35px a row: a 26px numeral, 2px of air, the 3px tick, and 2px of padding
	     either side. The gaps are the smallest that still read as gaps — a card of
	     six rows spends every one of them six times over, and the sidebar has a
	     list of calendars to fit under it. -->
	<button
		type="button"
		class="group flex flex-col items-center gap-0.5 py-0.5"
		:aria-current="day.isSelected ? 'date' : undefined"
		@click="emit('select', day)"
	>
		<!-- Every mark a day can wear is the same mark: a circle the size of the
		     numeral's own line. Today's is filled dark and the numeral reverses out
		     of it; the day the calendar is on wears the same circle in gray; a
		     pointed-at day wears it lighter still.

		     A filled *cell* said the same things at a different shape — a rounded
		     box behind the numeral and its tick — so a marked day and a marked
		     today were two unrelated things happening in one column. It also put
		     the tick on a dark ground, where a calendar's colour cannot be read,
		     which made the mark that says whose into a second mark saying today. -->
		<span
			class="flex size-6.5 items-center justify-center rounded-full text-sm"
			:class="
				day.isToday
					? 'bg-surface-gray-10 text-ink-gray-1'
					: day.isSelected
						? 'bg-surface-gray-3 text-ink-gray-8'
						: day.inMonth
							? 'text-ink-gray-8 group-hover:bg-surface-gray-2'
							: 'text-ink-gray-3 group-hover:bg-surface-gray-2'
			"
		>
			{{ day.date.date() }}
		</span>
		<!-- The tick steps 6 → 11 → 16px for one, a few, and many events. Its width
		     is the day's load; its colour is split into one segment per calendar
		     with something on the day, so the silhouette reads as density and the
		     colours say whose. Days of the neighbouring months stay bare: their
		     number is orientation, not an invitation to read what is on them.

		     It keeps its place when there is nothing to draw — the row of numerals
		     sits where it does whether or not the days under it are busy. -->
		<span
			class="flex h-[3px] items-center gap-px"
			:class="day.load === 1 ? 'w-1.5' : day.load <= 3 ? 'w-[11px]' : 'w-4'"
		>
			<template v-if="day.inMonth && day.load">
				<span
					v-for="color in day.colors"
					:key="color"
					class="h-full min-w-0 flex-1 rounded-full opacity-80"
					:style="{ backgroundColor: tickColor(color) }"
				/>
			</template>
		</span>
	</button>
</template>

<script setup lang="ts">
import { CalendarColorMap } from 'frappe-ui/experimental'

import type { GridDay } from '@/apps/calendar/composables/useMonthGrid'

defineProps<{ day: GridDay }>()

const emit = defineEmits<{ select: [day: GridDay] }>()

const tickColor = (color: string) => CalendarColorMap[color]?.color || CalendarColorMap.green.color
</script>
