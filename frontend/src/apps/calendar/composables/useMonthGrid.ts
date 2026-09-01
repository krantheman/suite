import { computed, toValue } from 'vue'

import dayjs from '@/apps/calendar/utils/dayjs'

import type { MaybeRefOrGetter } from 'vue'

/**
 * The day model behind every date grid in the app — the sidebar's MiniMonth
 * card, the phone's month, the phone's week strip. What differs between them is
 * how big a day is drawn and what the density is drawn as; which days there
 * are, and how loaded each one is, is one answer.
 */

export interface GridEvent {
	/** Inclusive day span, `YYYY-MM-DD`. */
	fromDate: string
	toDate: string
	color?: string
	isDeclined?: boolean
}

export interface GridDay {
	/** YYYY-MM-DD. */
	key: string
	date: dayjs.Dayjs
	inMonth: boolean
	isToday: boolean
	isSelected: boolean
	/** How many events touch the day. */
	load: number
	/** Palette names of the calendars with something on the day, first seen first. */
	colors: string[]
}

/** Segments a density mark splits into; more than three would be slivers. */
export const MAX_SEGMENTS = 3

/**
 * How busy a day is, and whose calendars make it so. A draft claims the time,
 * so it counts; a decline gives it back, so it does not.
 */
export const dayLoad = (events: GridEvent[], key: string) => {
	let load = 0
	const colors: string[] = []
	for (const event of events) {
		if (event.isDeclined) continue
		if (event.fromDate > key || event.toDate < key) continue
		load++
		const color = event.color || 'green'
		if (!colors.includes(color) && colors.length < MAX_SEGMENTS) colors.push(color)
	}
	return { load, colors }
}

/** The seven days of the week `date` falls in, Sunday first. */
export const weekDays = (
	date: MaybeRefOrGetter<Date | string>,
	events: MaybeRefOrGetter<GridEvent[]>,
	selectedKey: MaybeRefOrGetter<string> = '',
) =>
	computed<GridDay[]>(() => {
		const anchor = dayjs(toValue(date))
		const start = anchor.subtract(anchor.day(), 'day')
		return buildDays(start, 7, anchor.month(), toValue(events), toValue(selectedKey))
	})

/**
 * Six rows of the month `month`/`year`, Sunday first, padded with the
 * neighbouring months — a fixed height, so paging never resizes the grid.
 */
export const monthDays = (
	month: MaybeRefOrGetter<number>,
	year: MaybeRefOrGetter<number>,
	events: MaybeRefOrGetter<GridEvent[]>,
	selectedKey: MaybeRefOrGetter<string> = '',
) =>
	computed<GridDay[]>(() => {
		const viewedMonth = toValue(month)
		const first = dayjs(new Date(toValue(year), viewedMonth, 1))
		const start = first.subtract(first.day(), 'day')
		return buildDays(start, 42, viewedMonth, toValue(events), toValue(selectedKey))
	})

const buildDays = (
	start: dayjs.Dayjs,
	count: number,
	month: number,
	events: GridEvent[],
	selectedKey: string,
): GridDay[] => {
	const today = dayjs().format('YYYY-MM-DD')
	return Array.from({ length: count }, (_, i) => {
		const date = start.add(i, 'day')
		const key = date.format('YYYY-MM-DD')
		return {
			key,
			date,
			inMonth: date.month() === month,
			isToday: key === today,
			isSelected: key === selectedKey,
			...dayLoad(events, key),
		}
	})
}
