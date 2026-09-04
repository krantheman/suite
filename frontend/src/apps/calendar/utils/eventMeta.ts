import { getRepeatMessage } from '@/apps/calendar/utils/format'

/**
 * What a listed event says about itself beyond its title.
 *
 * The phone's agenda, the desktop agenda and the day view's schedule rail all
 * show an event as a row, and a row has a second line. This is what goes on it,
 * kept in one place so the three surfaces cannot drift into describing the same
 * event three different ways.
 *
 * frappe-ui derives what it can from its own generic event shape; everything
 * here needs suite's — locations, participants, meet links, recurrence — and so
 * reaches the calendar through its `#event-description` and `#event-suffix`
 * slots.
 */

interface MetaEvent {
	locations?: Array<{ _name?: string }>
	links?: Array<{ href?: string }>
	recurrence_rule?: { frequency?: string }
	participants?: Array<{ participation_status?: string }>
}

/**
 * The second line: whatever the row can say in a few words about where the
 * event is and who else is in it — the location, else the meeting, else how
 * often it repeats. A row without any of that stays one line tall.
 */
/** Where it is: the location, else the meeting it happens in. */
export const eventPlace = (event: MetaEvent): string => {
	const place = event.locations?.find((l) => l._name)?._name
	if (place) return place
	if (event.links?.some((l) => l?.href?.includes('/meet/'))) return __('Frappe Meet')
	return ''
}

/** How often it comes round, as the formatter writes it — "Every week on Thursday". */
export const eventRepeat = (event: MetaEvent): string => {
	if (!event.recurrence_rule?.frequency) return ''
	return getRepeatMessage(event.recurrence_rule) || ''
}

/** How many said yes — worth saying only once it is a crowd rather than a pair. */
export const eventGoing = (event: MetaEvent): string => {
	const going = event.participants?.filter(
		(p) => p.participation_status === 'ACCEPTED',
	).length
	return going && going > 1 ? __('{0} going', [String(going)]) : ''
}

/**
 * The whole line, in reading order: where, how often, how many. The phone shows
 * this as it stands; the desktop composes the same parts around the calendar's
 * own note about an event running on past the day.
 */
export const eventDescription = (event: MetaEvent): string =>
	[eventPlace(event), eventRepeat(event), eventGoing(event)]
		.filter(Boolean)
		.join(' · ')
