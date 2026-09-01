<template>
	<!-- The calendar at phone width. The desktop week and day grids do not
	     survive 390px — a column per day leaves nothing to write in — so the
	     phone has two views instead: an agenda, which is home, and the month.
	     Both are the same list of events read at a different range. -->
	<div class="flex min-h-0 flex-1 flex-col">
		<!-- A flat h-14 title row on mail's geometry — hamburger, then the period,
		     then actions — so on a phone the two apps share one top edge. The
		     hamburger opens the view switcher, where mail's opens its folders:
		     which list you are looking at is the same question in both. -->
		<div class="flex h-14 items-center gap-1 px-1">
			<button
				:aria-label="__('Switch view')"
				class="text-ink-gray-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
				@click="openViewSheet"
			>
				<Menu :size="18" />
			</button>
			<h1 class="min-w-0 flex-1 truncate text-xl font-medium text-ink-gray-9">
				{{ title.month }}
				<span class="text-ink-gray-4 font-normal">{{ title.year }}</span>
			</h1>
			<!-- Today is a step away whenever the view has wandered off it. -->
			<Button
				v-if="!showingToday"
				variant="ghost"
				:label="__('Today')"
				@click="emit('selectDate', todayKey)"
			/>
		</div>

		<WeekStrip
			v-if="!isMonth"
			:anchor="selected"
			:selected="selected"
			:events="events"
			@select="(date) => emit('selectDate', date)"
		/>
		<template v-else>
			<MonthGrid
				:month="viewedMonth.month"
				:year="viewedMonth.year"
				:selected="selected"
				:events="events"
				@select="(date) => emit('selectDate', date)"
			/>
			<div class="mx-3 mt-1 border-b" />
		</template>

		<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
			<AgendaList
				:sections="sections"
				:now="now"
				:open-event="openEvent"
				:open-row="openRow"
				:empty-label="isMonth ? __('Nothing on this day') : __('Nothing coming up')"
				@select="(event, date) => emit('selectEvent', event, date)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from 'frappe-ui'
import { Menu } from 'lucide-vue-next'

import dayjs from '@/apps/calendar/utils/dayjs'
import { useViewSheet } from '@/apps/calendar/composables/useViewSheet'
import { groupEventsByDay } from '@/apps/calendar/utils/agenda'
import AgendaList from '@/apps/calendar/components/mobile/AgendaList.vue'
import MonthGrid from '@/apps/calendar/components/mobile/MonthGrid.vue'
import WeekStrip from '@/apps/calendar/components/mobile/WeekStrip.vue'

import type { AgendaEvent } from '@/apps/calendar/utils/agenda'
import type { MobileView } from '@/apps/calendar/utils/mobileView'

const props = defineProps<{
	events: AgendaEvent[]
	/** The day both views are on, `YYYY-MM-DD`. */
	selected: string
	view: MobileView
	now: Date
	openEvent?: AgendaEvent | null
	/** Which row opened the sheet — a multi-day event has one per day it covers. */
	openRow?: string
}>()

const emit = defineEmits<{
	selectDate: [date: string]
	selectEvent: [event: AgendaEvent, date: string]
}>()

// The sheet itself is mounted by the tab bar, which is also allowed to open it.
const { openViewSheet } = useViewSheet()

const isMonth = computed(() => props.view === 'month')

const todayKey = computed(() => dayjs(props.now).format('YYYY-MM-DD'))

const showingToday = computed(() => props.selected === todayKey.value)

const viewedMonth = computed(() => {
	const day = dayjs(props.selected)
	return { month: day.month(), year: day.year() }
})

const title = computed(() => {
	const day = dayjs(props.selected)
	return { month: day.format('MMMM'), year: day.format('YYYY') }
})

/**
 * The agenda runs forward from the selected day — the phone's home view is
 * "what is coming", not "what happened". The month view answers a narrower
 * question: the grid is the overview, so the list under it is only the day the
 * grid has selected.
 */
const sections = computed(() => {
	const all = groupEventsByDay(props.events, { from: props.selected, today: todayKey.value })
	return isMonth.value ? all.filter((section) => section.date === props.selected) : all
})
</script>
