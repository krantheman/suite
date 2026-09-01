import { beforeAll, describe, expect, it } from 'vitest'

import dayjs from '@/apps/calendar/utils/dayjs'
import {
	formatAgendaTime,
	groupEventsByDay,
	nowMarkerIndex,
	sectionLabel,
} from '@/apps/calendar/utils/agenda'

import type { AgendaEvent } from '@/apps/calendar/utils/agenda'

// The helpers translate their labels; the app installs the global at boot.
beforeAll(() => {
	window.__ = window.__ ?? ((text: string) => text)
	globalThis.__ = globalThis.__ ?? ((text: string) => text)
})

const event = (partial: Partial<AgendaEvent> & { id: string }): AgendaEvent => ({
	fromDate: '2026-08-20',
	toDate: '2026-08-20',
	fromTime: '09:00',
	toTime: '10:00',
	title: partial.id,
	...partial,
})

describe('groupEventsByDay', () => {
	it('groups by day, earliest day first', () => {
		const sections = groupEventsByDay(
			[
				event({ id: 'fri', fromDate: '2026-08-21', toDate: '2026-08-21' }),
				event({ id: 'thu' }),
			],
			{ today: '2026-08-20' },
		)

		expect(sections.map((s) => s.date)).toEqual(['2026-08-20', '2026-08-21'])
		expect(sections[0].events.map((e) => e.id)).toEqual(['thu'])
	})

	it('lists a multi-day event on every day it covers', () => {
		const sections = groupEventsByDay(
			[event({ id: 'sprint', fromDate: '2026-08-24', toDate: '2026-08-26', isAllDay: true })],
			{ today: '2026-08-20' },
		)

		expect(sections.map((s) => s.date)).toEqual(['2026-08-24', '2026-08-25', '2026-08-26'])
		expect(sections.every((s) => s.events[0].id === 'sprint')).toBe(true)
	})

	it('leaves out days with nothing on them', () => {
		const sections = groupEventsByDay([event({ id: 'thu' })], { today: '2026-08-20' })

		expect(sections).toHaveLength(1)
	})

	it('clips days before the start but keeps an event still running', () => {
		const sections = groupEventsByDay(
			[
				event({ id: 'over', fromDate: '2026-08-18', toDate: '2026-08-18' }),
				event({ id: 'running', fromDate: '2026-08-18', toDate: '2026-08-22', isAllDay: true }),
			],
			{ today: '2026-08-20' },
		)

		expect(sections.map((s) => s.date)).toEqual(['2026-08-20', '2026-08-21', '2026-08-22'])
		expect(sections[0].events.map((e) => e.id)).toEqual(['running'])
	})

	it('puts all-day events above timed ones, then orders by start', () => {
		const sections = groupEventsByDay(
			[
				event({ id: 'late', fromTime: '16:00', toTime: '16:30' }),
				event({ id: 'early', fromTime: '09:00', toTime: '09:30' }),
				event({ id: 'allday', isAllDay: true }),
			],
			{ today: '2026-08-20' },
		)

		expect(sections[0].events.map((e) => e.id)).toEqual(['allday', 'early', 'late'])
	})

	it('names today, and dates every other day', () => {
		expect(sectionLabel('2026-08-20', '2026-08-20')).toBe('Today · Thu 20')
		expect(sectionLabel('2026-08-21', '2026-08-20')).toBe('Fri 21')
	})
})

describe('formatAgendaTime', () => {
	it('says all day rather than a span of hours', () => {
		expect(formatAgendaTime(event({ id: 'a', isAllDay: true }))).toBe('All day')
	})

	it('gives a short event only its start, without an empty :00', () => {
		expect(formatAgendaTime(event({ id: 'a', fromTime: '16:00', toTime: '16:30' }))).toBe('4 pm')
		expect(formatAgendaTime(event({ id: 'a', fromTime: '14:30', toTime: '15:00' }))).toBe(
			'2:30 pm',
		)
	})

	it('keeps a range off the rail when either end carries minutes', () => {
		expect(formatAgendaTime(event({ id: 'a', fromTime: '14:30', toTime: '15:30' }))).toBe(
			'2:30 pm',
		)
		expect(formatAgendaTime(event({ id: 'a', fromTime: '14:00', toTime: '15:30' }))).toBe('2 pm')
	})

	it('gives whole hours both ends, sharing one meridiem where it can', () => {
		expect(formatAgendaTime(event({ id: 'a', fromTime: '12:00', toTime: '13:00' }))).toBe(
			'12 – 1 pm',
		)
		expect(formatAgendaTime(event({ id: 'a', fromTime: '09:00', toTime: '17:00' }))).toBe(
			'9 am – 5 pm',
		)
	})

	it('spells the end of an event that runs into the next day', () => {
		expect(
			formatAgendaTime(
				event({
					id: 'a',
					fromDate: '2026-08-20',
					toDate: '2026-08-21',
					fromTime: '23:00',
					toTime: '01:00',
				}),
			),
		).toBe('11 pm – 1 am')
	})
})

describe('nowMarkerIndex', () => {
	const today = '2026-08-20'
	const sections = () =>
		groupEventsByDay(
			[
				event({ id: 'done', fromTime: '12:00', toTime: '13:00' }),
				event({ id: 'next', fromTime: '14:30', toTime: '15:00' }),
			],
			{ today },
		)

	it('sits before the first event still to come', () => {
		expect(nowMarkerIndex(sections()[0], dayjs(`${today}T13:24`))).toBe(1)
	})

	it('stays away when the whole day is still ahead', () => {
		expect(nowMarkerIndex(sections()[0], dayjs(`${today}T08:00`))).toBe(-1)
	})

	it('stays away once the day is over', () => {
		expect(nowMarkerIndex(sections()[0], dayjs(`${today}T20:00`))).toBe(-1)
	})

	it('belongs to today only', () => {
		const tomorrow = groupEventsByDay(
			[event({ id: 'a', fromDate: '2026-08-21', toDate: '2026-08-21' })],
			{ today },
		)[0]

		expect(nowMarkerIndex(tomorrow, dayjs(`${today}T13:24`))).toBe(-1)
	})
})
