import type { Dayjs } from 'dayjs'

import dayjs from '@/apps/calendar/utils/dayjs'

/**
 * The agenda list's own arithmetic — what a phone shows instead of a grid.
 * Kept apart from the components so the grouping and the time labels can be
 * read and tested without mounting anything.
 */

export interface AgendaEvent {
	id: string
	recurrence_id?: string
	title?: string
	/** Inclusive day span, as `transformEvent` hands it over. */
	fromDate: string
	toDate: string
	fromTime: string
	toTime: string
	isAllDay?: boolean
	[key: string]: any
}

export interface AgendaSection {
	/** YYYY-MM-DD. */
	date: string
	/** "Today · Thu 20", or "Fri 21" on any other day. */
	label: string
	isToday: boolean
	events: AgendaEvent[]
}

/** A day an event covers, counted in whole days from its first to its last. */
const daysCovered = (event: AgendaEvent) => {
	const from = dayjs(event.fromDate)
	const to = dayjs(event.toDate)
	const span = Math.max(to.diff(from, 'day'), 0)
	return Array.from({ length: span + 1 }, (_, i) => from.add(i, 'day').format('YYYY-MM-DD'))
}

/**
 * A day's events in reading order: all-day first — they frame the day rather
 * than sit at a point in it — then by start time, then by title so a redraw
 * never reshuffles two events that begin together.
 */
const byStart = (a: AgendaEvent, b: AgendaEvent) => {
	if (!!a.isAllDay !== !!b.isAllDay) return a.isAllDay ? -1 : 1
	if (a.fromTime !== b.fromTime) return a.fromTime < b.fromTime ? -1 : 1
	return (a.title ?? '').localeCompare(b.title ?? '')
}

/**
 * Groups events into the day sections the agenda renders, one entry per day an
 * event covers — a sprint that runs Monday to Wednesday belongs to all three,
 * the way it spans three columns in the week grid.
 *
 * Days with nothing on them are left out: the agenda is a list of what is
 * happening, not a ledger of every date. `from` clips the past away (the list
 * opens on today) without touching an event that started earlier and is still
 * running.
 */
export const groupEventsByDay = (
	events: AgendaEvent[],
	options: { from?: string; today?: string } = {},
): AgendaSection[] => {
	const today = options.today ?? dayjs().format('YYYY-MM-DD')
	const from = options.from ?? today

	const byDay = new Map<string, AgendaEvent[]>()
	for (const event of events)
		for (const day of daysCovered(event)) {
			if (day < from) continue
			const bucket = byDay.get(day)
			if (bucket) bucket.push(event)
			else byDay.set(day, [event])
		}

	return [...byDay.entries()]
		.sort(([a], [b]) => (a < b ? -1 : 1))
		.map(([date, dayEvents]) => ({
			date,
			label: sectionLabel(date, today),
			isToday: date === today,
			events: [...dayEvents].sort(byStart),
		}))
}

/** "Today · Thu 20" on today, "Fri 21" on any other day. */
export const sectionLabel = (date: string, today = dayjs().format('YYYY-MM-DD')) => {
	const day = dayjs(date)
	const stamp = day.format('ddd D')
	return date === today ? `${__('Today')} · ${stamp}` : stamp
}

/** "4:00 pm" reads as precision the event does not have; "4 pm" is the same time. */
const clock = (time: Dayjs, withMeridiem = true) =>
	time.format(time.minute() ? 'h:mm' : 'h') + (withMeridiem ? time.format(' a') : '')

/**
 * The time column, which is a narrow rail the titles align against — so what
 * goes in it has to be short before it has to be complete.
 *
 * A range is spelled out only when both ends land on the hour: "12 – 1 pm",
 * "9 am – 5 pm". Give either end minutes and the range stops fitting the rail
 * ("2:30 – 3:30 pm"), so the row says when the event starts and leaves the end
 * to the sheet — which is the reading the design's own rows take. A range also
 * drops the meridiem from its start when both ends share one.
 */
export const formatAgendaTime = (event: AgendaEvent): string => {
	if (event.isAllDay) return __('All day')

	const start = dayjs(`${event.fromDate}T${event.fromTime}`)
	const end = dayjs(`${event.toDate}T${event.toTime}`)
	if (!start.isValid()) return ''
	if (!end.isValid() || end.diff(start, 'minute') < 60) return clock(start)
	if (start.minute() || end.minute()) return clock(start)

	return `${clock(start, start.format('a') !== end.format('a'))} – ${clock(end)}`
}

/**
 * Where the now-line goes in a day's list: before the first event still to
 * come, so it reads as the boundary between done and next. -1 when the whole
 * day is behind or ahead of it — the line only belongs to the day in progress.
 */
export const nowMarkerIndex = (section: AgendaSection, now: Dayjs = dayjs()): number => {
	if (!section.isToday) return -1

	const index = section.events.findIndex(
		(event) => !event.isAllDay && dayjs(`${event.fromDate}T${event.fromTime}`).isAfter(now),
	)
	// Past the day's last event the line would sit at the bottom saying nothing;
	// before the first, it would push the day down for no reason.
	if (index <= 0) return -1
	return index
}
