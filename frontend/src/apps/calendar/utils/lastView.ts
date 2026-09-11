/**
 * The view the calendar was last left in, so coming back to it opens where you
 * were rather than where the app starts.
 *
 * Kept as the route name rather than the fui Calendar's own `activeView`: the
 * route is what the guard has to hand when it expands a shortcut, and it is
 * also the only one of the two that exists before the view mounts.
 *
 * localStorage, the way the active account is remembered — a preference of this
 * kind belongs to the browser someone works in, not to their user record, and
 * it is not worth a round trip on every page load.
 */

const STORAGE_KEY = 'calendar-view'

/**
 * Every view the calendar offers, on either device: the phone draws the same
 * four, on the same routes, at its own width. It drew three for a while — a week
 * of seven columns had nothing legible in it until the week learnt to be narrow
 * — and a preference for the one it was missing had to be declined at the door.
 */
const VIEWS = [
	'calendar-month',
	'calendar-week',
	'calendar-day',
	'calendar-agenda',
] as const

export type CalendarViewRoute = (typeof VIEWS)[number]

/** Remembers `name`, if it is a view route at all. */
export const rememberCalendarView = (name: unknown) => {
	if (typeof name !== 'string') return
	if (!VIEWS.includes(name as CalendarViewRoute)) return
	try {
		localStorage.setItem(STORAGE_KEY, name)
	} catch {
		// Private windows and blocked site data throw on write. A forgotten
		// preference is not worth failing navigation over.
	}
}

/**
 * The remembered view, or null — nothing stored, or something stored that is not
 * a view. The caller supplies the default it wants instead, since that differs
 * between the phone and the desktop.
 */
export const lastCalendarView = (): CalendarViewRoute | null => {
	let stored: string | null = null
	try {
		stored = localStorage.getItem(STORAGE_KEY)
	} catch {
		return null
	}
	if (!stored) return null
	return VIEWS.includes(stored as CalendarViewRoute) ? (stored as CalendarViewRoute) : null
}
