import { describe, expect, it, vi } from 'vitest'

import { eventDescription } from './eventMeta'

// The formatter calls the global `__()` the translation boot installs at app start.
vi.stubGlobal('__', (text: string, args?: string[]) =>
	args ? text.replace('{0}', args[0]!) : text,
)

describe('eventDescription', () => {
	it('says nothing about an event with nowhere to be', () => {
		expect(eventDescription({})).toBe('')
	})

	it('prefers the location to the meeting link', () => {
		expect(
			eventDescription({
				locations: [{ _name: 'Hall 2' }],
				links: [{ href: 'https://example.com/meet/abc' }],
			}),
		).toBe('Hall 2')
	})

	it('falls back to the meeting when there is no location', () => {
		expect(
			eventDescription({ links: [{ href: 'https://example.com/meet/abc' }] }),
		).toBe('Frappe Meet')
	})

	it('adds how often it repeats, as the formatter writes it', () => {
		const line = eventDescription({
			locations: [{ _name: 'Hall 2' }],
			recurrence_rule: { frequency: 'weekly' },
		})
		expect(line.startsWith('Hall 2 · Every ')).toBe(true)
	})

	// One other person is not worth counting out loud; a crowd is.
	it('counts the crowd, but only once there is one', () => {
		const going = (n: number) => ({
			participants: Array.from({ length: n }, () => ({
				participation_status: 'ACCEPTED',
			})),
		})
		expect(eventDescription(going(1))).toBe('')
		expect(eventDescription(going(14))).toBe('14 going')
	})

	it('does not count people who have not accepted', () => {
		expect(
			eventDescription({
				participants: [
					{ participation_status: 'ACCEPTED' },
					{ participation_status: 'ACCEPTED' },
					{ participation_status: 'NEEDS-ACTION' },
					{ participation_status: 'DECLINED' },
				],
			}),
		).toBe('2 going')
	})
})
