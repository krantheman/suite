<template>
	<!-- The month at thumb size. Six rows always, so paging never resizes the
	     grid and the agenda below it never jumps. The days themselves are the
	     sidebar card's own cells — see MonthDayCell — since a day is the same
	     question at either size: which one, and how busy. -->
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
			<MonthDayCell
				v-for="day in days"
				:key="day.key"
				:day="day"
				@select="(picked) => emit('select', picked.key)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import MonthDayCell from '@/apps/calendar/components/MonthDayCell.vue'
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
</script>
