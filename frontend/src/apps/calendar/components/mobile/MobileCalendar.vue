<template>
	<!-- The calendar at phone width. The desktop week grid does not survive
	     390px — seven columns leave nothing to write in — so the phone has three
	     views instead: an agenda, which is home; a day, which is one column and
	     fits; and the month. All three are the same events read at a different
	     range, and two of them are the library's own views, told to draw no
	     header and one mode. -->
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
				<!-- 24px at stroke 2, as mail's is: three strokes on their own went
				     thin against the title beside them. -->
				<Menu :size="24" class="[stroke-width:2]" />
			</button>
			<!-- The title is also the way to a date: the month grid is a tap on it away,
			     which is the one navigation the arrows beside it cannot do — they step,
			     and a month away is twelve steps. The chevron is what says so. The month
			     view is its own grid already, so there it is a heading and nothing more. -->
			<component
				:is="isMonth ? 'h1' : 'button'"
				:type="isMonth ? undefined : 'button'"
				:aria-label="isMonth ? undefined : __('Pick a date')"
				class="flex min-w-0 flex-1 items-center gap-1 text-xl font-medium text-ink-gray-9"
				@click="!isMonth && (isPickerOpen = true)"
			>
				<span class="min-w-0 truncate">
					<template v-if="isMonth">
						{{ title.month }}
						<span class="text-ink-gray-4 font-normal">{{ title.year }}</span>
					</template>
					<!-- A day names itself, weekday first: it is the one view whose title a
					     reader checks against the day they meant to open. -->
					<template v-else-if="isDay">{{ dayTitle }}</template>
					<!-- The agenda names the span it is showing, which is the library's own
					     label for it — "Sep - Nov 2026". -->
					<template v-else>{{ agendaTitle }}</template>
				</span>
				<ChevronDown v-if="!isMonth" class="size-4 shrink-0 text-ink-gray-5" />
			</component>
			<!-- The view's own navigation, on the row that names what it is showing: a
			     step back, a step on, and the way home — a month at a time in the list,
			     a day at a time in the day. Today is not hidden when the anchor is
			     already today: a list scrolls, so "on today" and "looking at today" are
			     different things, and it is the second one this answers. -->
			<!-- 40px targets, round, the size the hamburger opposite them is: a 28px
			     icon button sat its glyph 10px from the screen's edge against the
			     hamburger's 15px on the other side, and read as pushed against it. The
			     same size on both ends puts the two glyphs the same distance in, and
			     gives the arrows a target a thumb can hit. -->
			<div class="flex shrink-0 items-center">
				<Button
					v-if="!isMonth"
					variant="ghost"
					class="!size-10 !rounded-full"
					:aria-label="__('Previous')"
					@click="step(-1)"
				>
					<ChevronLeft class="size-4 text-ink-gray-7" />
				</Button>
				<Button
					variant="ghost"
					class="!h-10 !rounded-full"
					:label="__('Today')"
					@click="goToToday"
				/>
				<Button
					v-if="!isMonth"
					variant="ghost"
					class="!size-10 !rounded-full"
					:aria-label="__('Next')"
					@click="step(1)"
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

		<!-- The agenda and the day are the library's own, the ones the desktop reads:
		     the list of days under the week they fall in, and the single column with its
		     hours down the side. The phone brings its own header, so the Calendar's
		     header slot is filled with nothing and every mode but the one wanted is
		     turned off. Its date is this view's, pushed in whenever the header moves.

		     Keyed on the view: the mode a Calendar opens in is the one it is built with,
		     so switching between them is a new Calendar rather than a message to the old
		     one.

		     The month view keeps the compact list below its grid: that list answers "what
		     is on this day", and the library's agenda spans a month from its anchor with
		     no way to ask it for one day. -->
		<Calendar
			v-if="!isMonth"
			:key="view"
			ref="agenda"
			class="min-h-0 flex-1"
			:events="events"
			:config="config"
			:loading="loading"
			:on-click="({ calendarEvent }) => emit('selectEvent', calendarEvent, calendarEvent.fromDate)"
			:on-cell-click="(slot) => emit('selectSlot', slot)"
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

		<!-- The date picker: the phone's own month grid, in the sheet every other
		     switcher on this app uses. Its dots come from the events already fetched,
		     so a month paged past the fetched window draws its dates and no density —
		     picking a day there is what fetches it. -->
		<BottomSheet v-model:open="isPickerOpen">
			<div class="pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
				<div class="flex items-center gap-1 px-3 pb-1">
					<span class="flex-1 truncate text-base font-medium text-ink-gray-8">
						{{ pickerTitle }}
					</span>
					<!-- The header's own arrows, at the header's own size: an icon button on
					     this app's phone is a 40px circle, wherever it is drawn. -->
					<Button
						variant="ghost"
						class="!size-10 !rounded-full"
						:aria-label="__('Previous month')"
						@click="pagePicker(-1)"
					>
						<ChevronLeft class="size-4 text-ink-gray-7" />
					</Button>
					<Button
						variant="ghost"
						class="!size-10 !rounded-full"
						:aria-label="__('Next month')"
						@click="pagePicker(1)"
					>
						<ChevronRight class="size-4 text-ink-gray-7" />
					</Button>
				</div>
				<!-- The circle marks a day the view is actually on, which is the day
				     view and not the agenda: a list spanning three months is anchored
				     on a date rather than showing one, and a circle in the grid claimed
				     more than that. The desktop's card draws the same distinction. -->
				<MonthGrid
					:month="pickerMonth.month"
					:year="pickerMonth.year"
					:selected="isDay ? selected : ''"
					:events="events"
					@select="pickDate"
				/>
			</div>
		</BottomSheet>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { BottomSheet, Button } from 'frappe-ui'
import { Calendar } from 'frappe-ui/experimental'
import { ChevronDown, ChevronLeft, ChevronRight, Menu } from 'lucide-vue-next'

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
	/** An empty slot in the day grid: the hour tapped, or its all-day row. */
	selectSlot: [slot: { date: Date | string; time: string; isFullDay: boolean }]
}>()

// The sheet itself is mounted by the tab bar, which is also allowed to open it.
const { openViewSheet } = useViewSheet()

const isMonth = computed(() => props.view === 'month')
const isDay = computed(() => props.view === 'day')

/**
 * The date picker, and the month it is showing — its own, so paging through it
 * moves nothing until a date is picked. It opens on the month of the day the
 * view is on, however far the picker was last paged.
 */
const isPickerOpen = ref(false)
const pickerMonth = ref({ month: 0, year: 0 })

watch(isPickerOpen, (open) => open && (pickerMonth.value = viewedMonth.value))

const pagePicker = (months: number) => {
	const paged = dayjs(new Date(pickerMonth.value.year, pickerMonth.value.month)).add(
		months,
		'month',
	)
	pickerMonth.value = { month: paged.month(), year: paged.year() }
}

const pickerTitle = computed(() =>
	dayjs(new Date(pickerMonth.value.year, pickerMonth.value.month)).format('MMMM YYYY'),
)

const pickDate = (date: string) => {
	isPickerOpen.value = false
	emit('selectDate', date)
}

/**
 * One mode, and nothing the phone already draws.
 *
 * The other modes go because the view switcher is the tab bar's sheet, the shortcuts
 * go because there is no keyboard, and editing goes because a tap is how the phone
 * scrolls and opens rather than how it creates — the + button is where creating
 * lives, a tapped event opens the same sheet the agenda opens, and a tapped hour
 * opens the same event screen the + button does — `onCellClick` takes the tap
 * before the library's own modal can have it, which is what leaves editing off
 * while the day grid still creates. noBorder leaves the view its top rule and no
 * box: it is the page here, not a pane on one.
 */
const config = computed(() => {
	const mode = isDay.value ? ('Day' as const) : ('Agenda' as const)
	return {
		defaultMode: mode,
		disableModes: (['Agenda', 'Day', 'Week', 'Month'] as const).filter(
			(other) => other !== mode,
		),
		enableShortcuts: false,
		isEditMode: false,
		noBorder: true,
	}
})

// Whichever of the two library views is mounted — the list or the day.
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

/** "Wednesday, 9 Sep" — the day this view is one of. */
const dayTitle = computed(() => dayjs(props.selected).format('dddd, D MMM'))

/**
 * A step back or on: a month in the list, a day in the day view.
 *
 * The day steps by moving the date this view is on, not by asking the Calendar to
 * increment itself — the date is what the route, the title and the fetch window all
 * read, and a Calendar that walked off on its own would leave the three of them
 * behind. The list is the other way round: it is scrolled rather than dated, so its
 * own increment is what moves it, and its title comes back from the same place.
 */
const step = (delta: number) => {
	if (!isDay.value) {
		delta < 0 ? agenda.value?.decrement() : agenda.value?.increment()
		return
	}
	emit('selectDate', dayjs(props.selected).add(delta, 'day').format('YYYY-MM-DD'))
}

// This view owns the date; the library's follows it. Immediate, because a Calendar
// mounts on its own today and this view may already be somewhere else — a reload
// lands on the day in the URL, not on this morning. The view is watched alongside
// the date for the same reason: switching between the list and the day mounts a
// second Calendar, on today again, with a date beside it that has not changed and
// so would not be pushed.
watch(
	[() => props.selected, () => props.view],
	([date]) => agenda.value?.setCalendarDate(date),
	{ immediate: true, flush: 'post' },
)

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
