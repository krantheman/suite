<template>
	<!-- The month at thumb size. Six rows always, so paging never resizes the
	     grid and the agenda below it never jumps. Density is dots rather than the
	     sidebar card's widening tick: at this size a tick would read as an
	     underline on the numeral. -->
	<div class="px-2.5">
		<div class="grid grid-cols-7">
			<span
				v-for="(letter, index) in weekdayLetters"
				:key="index"
				class="text-ink-gray-5 pb-1 pt-1.5 text-center text-[10px] uppercase tracking-[0.06em]"
			>
				{{ letter }}
			</span>
		</div>
		<div class="grid grid-cols-7 gap-y-0.5">
			<button
				v-for="day in days"
				:key="day.key"
				type="button"
				class="flex flex-col items-center gap-1 rounded-3 py-1"
				:class="day.isSelected && !day.isToday && 'bg-surface-gray-2'"
				:aria-current="day.isSelected ? 'date' : undefined"
				@click="emit('select', day.key)"
			>
				<span
					class="flex size-6.5 items-center justify-center rounded-full text-sm"
					:class="
						day.isToday
							? 'bg-surface-gray-10 text-ink-gray-1'
							: day.inMonth
								? 'text-ink-gray-8'
								: 'text-ink-gray-3'
					"
				>
					{{ day.date.date() }}
				</span>
				<!-- Neighbouring months stay bare: their numerals are orientation, not
				     an invitation to read what is on them. -->
				<span class="flex h-1 items-center gap-0.5">
					<template v-if="day.inMonth">
						<span
							v-for="color in day.colors"
							:key="color"
							class="size-1 rounded-full"
							:style="{ backgroundColor: paletteColor(color) }"
						/>
					</template>
				</span>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { CalendarColorMap } from 'frappe-ui/experimental'

import { monthDays } from '@/apps/calendar/composables/useMonthGrid'

import type { GridEvent } from '@/apps/calendar/composables/useMonthGrid'

const props = defineProps<{
	month: number
	year: number
	/** The selected day, `YYYY-MM-DD`. */
	selected: string
	events: GridEvent[]
}>()

const emit = defineEmits<{ select: [date: string] }>()

const weekdayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const days = monthDays(
	() => props.month,
	() => props.year,
	() => props.events,
	() => props.selected,
)

const paletteColor = (color: string) =>
	CalendarColorMap[color]?.color || CalendarColorMap.green.color
</script>
