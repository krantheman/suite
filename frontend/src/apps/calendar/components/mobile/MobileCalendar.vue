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
				<template v-if="isMonth">
					{{ title.month }}
					<span class="text-ink-gray-4 font-normal">{{ title.year }}</span>
				</template>
				<!-- The agenda names the span it is showing, which is the library's own
				     label for it — "Sep - Nov 2026". The month names the month. -->
				<template v-else>{{ agendaTitle }}</template>
			</h1>
			<!-- The list's own navigation, on the row that names what it is showing: a
			     month back, a month on, and the way home. Today is not hidden when the
			     anchor is already today — the list scrolls, so "on today" and "looking at
			     today" are different things, and it is the second one this answers. -->
			<div class="flex shrink-0 items-center">
				<Button
					v-if="!isMonth"
					variant="ghost"
					:aria-label="__('Previous')"
					@click="agenda?.decrement()"
				>
					<ChevronLeft class="size-4 text-ink-gray-7" />
				</Button>
				<Button variant="ghost" :label="__('Today')" @click="goToToday" />
				<Button
					v-if="!isMonth"
					variant="ghost"
					:aria-label="__('Next')"
					@click="agenda?.increment()"
				>
					<ChevronRight class="size-4 text-ink-gray-7" />
				</Button>
			</div>
		</div>

		<template v-if="isMonth">
			<MonthGrid
				:month="viewedMonth.month"
				:year="viewedMonth.year"
				:selected="selected"
				:events="events"
				@select="(date) => emit('selectDate', date)"
			/>
			<div class="mx-3 mt-1 border-b" />
		</template>

		<!-- The agenda is the library's own, the one the desktop reads: day cards under
		     the week they fall in, today edged and named. The phone brings its own header
		     and its own strip, so the Calendar's header slot is filled with nothing and
		     its modes are turned off — what is left is the list, which is all that was
		     wanted from it. Its date is the strip's, pushed in whenever the strip moves.

		     The month view keeps the compact list below its grid: that list answers "what
		     is on this day", and the library's agenda spans a month from its anchor with
		     no way to ask it for one day. -->
		<Calendar
			v-if="!isMonth"
			ref="agenda"
			class="min-h-0 flex-1"
			:events="events"
			:config="AGENDA_CONFIG"
			:loading="loading"
			:on-click="({ calendarEvent }) => emit('selectEvent', calendarEvent, calendarEvent.fromDate)"
		>
			<!-- The header this list would draw for itself — a month picker, a switcher
			     between four views — is the row above and the tab bar's sheet. Passing the
			     slot empty is how that is said. -->
			<template #header />
		</Calendar>
		<div v-else class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
			<AgendaList
				:sections="sections"
				:now="now"
				:open-event="openEvent"
				:open-row="openRow"
				:empty-label="__('Nothing on this day')"
				@select="(event, date) => emit('selectEvent', event, date)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue'
import { Button } from 'frappe-ui'
import { Calendar } from 'frappe-ui/experimental'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-vue-next'

import dayjs from '@/apps/calendar/utils/dayjs'
import { useViewSheet } from '@/apps/calendar/composables/useViewSheet'
import { groupEventsByDay } from '@/apps/calendar/utils/agenda'
import AgendaList from '@/apps/calendar/components/mobile/AgendaList.vue'
import MonthGrid from '@/apps/calendar/components/mobile/MonthGrid.vue'

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
	/** Whether the events for the visible range are still on their way. */
	loading?: boolean
}>()

const emit = defineEmits<{
	selectDate: [date: string]
	selectEvent: [event: AgendaEvent, date: string]
}>()

// The sheet itself is mounted by the tab bar, which is also allowed to open it.
const { openViewSheet } = useViewSheet()

/**
 * Agenda only, and nothing the phone already draws.
 *
 * The modes go because the view switcher is the tab bar's sheet, the shortcuts go
 * because there is no keyboard, and editing goes because a tap on a day is how the
 * phone scrolls rather than how it creates — the + button is where creating lives.
 * noBorder leaves the list its top rule and no box: it is the page here, not a pane
 * on one.
 */
const AGENDA_CONFIG = {
	defaultMode: 'Agenda' as const,
	disableModes: ['Month' as const, 'Week' as const, 'Day' as const],
	enableShortcuts: false,
	isEditMode: false,
	noBorder: true,
}

const agenda = useTemplateRef<{
	setCalendarDate: (date: string) => void
	currentMonthYear: string
	decrement: () => void
	increment: () => void
}>('agenda')

// The library's own name for the span it is listing. Empty for the first tick, before
// the list has mounted to be asked — the month's own title stands in until then.
// Today twice over: the anchor, so the strip-less month title follows, and the list
// itself, which is scrolled and would otherwise stay where it was left when the anchor
// it is already on is set again.
const goToToday = () => {
	emit('selectDate', todayKey.value)
	agenda.value?.setCalendarDate(todayKey.value)
}

const agendaTitle = computed(() => agenda.value?.currentMonthYear || title.value.month)

// The strip owns the date; the list follows it. Immediate, because the list mounts on
// its own today and the strip may already be somewhere else — a reload lands on the
// day in the URL, not on this morning.
watch(
	() => props.selected,
	(date) => agenda.value?.setCalendarDate(date),
	{ immediate: true, flush: 'post' },
)

const isMonth = computed(() => props.view === 'month')

const todayKey = computed(() => dayjs(props.now).format('YYYY-MM-DD'))

const viewedMonth = computed(() => {
	const day = dayjs(props.selected)
	return { month: day.month(), year: day.year() }
})

const title = computed(() => {
	const day = dayjs(props.selected)
	return { month: day.format('MMMM'), year: day.format('YYYY') }
})

/**
 * The list under the month grid: only the day the grid has selected. The grid is the
 * overview, so the list answers the narrower question — what is on this day. The
 * agenda view has no sections of its own any more; the library's list groups its own.
 */
const sections = computed(() =>
	groupEventsByDay(props.events, { from: props.selected, today: todayKey.value }).filter(
		(section) => section.date === props.selected,
	),
)
</script>
