import { computed, ref, watch } from 'vue'
import { createResource } from 'frappe-ui'

import dayjs from '@/apps/calendar/utils/dayjs'
import { fromEventZone } from '@/apps/calendar/utils/datetime'
import { eventLastDay, isAllDayEvent } from '@/apps/calendar/utils/eventTime'
import { userStore } from '@/apps/calendar/stores/user'

import type { GridEvent } from '@/apps/calendar/composables/useMonthGrid'

/**
 * The density behind the sidebar's mini month.
 *
 * That card is a navigation aid: paged to any month, it has to know which of its
 * days have something on them. Reading the main view's events tied it to the
 * window that view happened to fetch, so the ticks simply stopped a month or two
 * out — the days looked empty when they were not.
 *
 * So it asks for its own, from an endpoint that returns only what a tick is made
 * of. One month at a time, cached by month: paging back and forth over the same
 * few months costs one request each, ever.
 */

/** What `get_calendar_event_density` returns per event. */
interface DensityRow {
	start: string
	duration?: string
	time_zone?: string
	show_without_time?: boolean
	calendars: string[]
	is_declined?: boolean
}

/**
 * The day span an event covers, worked out the same way the grid works it out —
 * the helpers here are the ones `transformEvent` uses, rather than a second
 * reading of all-day-ness and inclusive ends that could disagree with it.
 */
const toGridEvent = (row: DensityRow, color: (calendar: string) => string): GridEvent => {
	const isAllDay = isAllDayEvent(row)
	const start = isAllDay ? dayjs(row.start) : fromEventZone(row.start, row.time_zone)
	const last = isAllDay
		? (eventLastDay(start, row.duration, true) ?? start)
		: start.add(dayjs.duration(row.duration || 'PT0S'))

	return {
		fromDate: start.format('YYYY-MM-DD'),
		toDate: last.format('YYYY-MM-DD'),
		color: color(row.calendars[0] ?? ''),
		isDeclined: !!row.is_declined,
	}
}

// Keyed by account and month, so paging back to somewhere already seen redraws
// from what is in hand instead of asking again. Module-scoped rather than per
// component: the cache has to be droppable from outside when an event is saved
// or deleted, and the card that draws it is nowhere near the code that does that.
const byMonth = ref<Record<string, GridEvent[]>>({})

/**
 * Forgets the cached density. Called after an event is created, edited or
 * deleted — the tick under that day is now wrong, and the card has no other way
 * to hear about it.
 */
export const invalidateEventDensity = () => {
	byMonth.value = {}
}

export const useEventDensity = (
	month: () => number,
	year: () => number,
	color: (calendar: string) => string,
) => {
	const store = userStore()

	const key = computed(() => `${store.accountId}:${year()}-${month() + 1}`)

	const density = createResource({
		url: 'suite.calendar.api.get_calendar_event_density',
		makeParams: () => {
			// The card's own six rows, which reach into the months either side of
			// the one it names — so the ticks on those spill-over days are real.
			const first = dayjs(new Date(year(), month(), 1))
			return {
				account: store.accountId,
				from_date: first.subtract(7, 'day').utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
				to_date: first.endOf('month').add(7, 'day').utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
				time_zone: dayjs.tz.guess(),
			}
		},
		// Silent: a card that cannot draw its ticks is worth less than a toast over
		// whatever the reader is actually doing.
		onError: () => {},
	})

	const load = () => {
		const wanted = key.value
		if (byMonth.value[wanted] || !store.accountId) return
		density.submit(undefined, {
			onSuccess: (rows: DensityRow[]) => {
				byMonth.value[wanted] = (rows ?? []).map((row) => toGridEvent(row, color))
			},
		})
	}

	watch(key, load, { immediate: true })

	// A dropped cache leaves the displayed month with nothing to draw, so it asks
	// again — for that month alone, not for every month it happens to have seen.
	watch(
		() => byMonth.value[key.value],
		(rows) => rows === undefined && load(),
	)

	return { events: computed(() => byMonth.value[key.value] ?? []) }
}
