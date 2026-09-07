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

/** Every view the desktop offers. */
const DESKTOP_VIEWS = [
	'calendar-month',
	'calendar-week',
	'calendar-day',
	'calendar-agenda',
] as const

/**
 * What the phone offers. A month of columns has nothing legible in it at that
 * width, and the phone renders the day route as its own agenda — so those two
 * routes are the whole of its view switcher, and a remembered `calendar-week`
 * would land it somewhere it cannot draw.
 */
const MOBILE_VIEWS = ['calendar-month', 'calendar-day'] as const

export type CalendarViewRoute = (typeof DESKTOP_VIEWS)[number]

const viewsFor = (isMobile: boolean): readonly string[] =>
	isMobile ? MOBILE_VIEWS : DESKTOP_VIEWS

/** Remembers `name`, if it is a view route at all. */
export const rememberCalendarView = (name: unknown) => {
	if (typeof name !== 'string') return
	if (!DESKTOP_VIEWS.includes(name as CalendarViewRoute)) return
	// A device the view does not fit is still worth remembering for the device it
	// does: someone who works in Week on a laptop and picks up their phone has not
	// stopped preferring Week.
	try {
		localStorage.setItem(STORAGE_KEY, name)
	} catch {
		// Private windows and blocked site data throw on write. A forgotten
		// preference is not worth failing navigation over.
	}
}

/**
 * The remembered view, or null — nothing stored, something else stored, or a
 * view this device cannot draw. The caller supplies the default it wants
 * instead, since that differs between the phone and the desktop.
 */
export const lastCalendarView = (isMobile: boolean): CalendarViewRoute | null => {
	let stored: string | null = null
	try {
		stored = localStorage.getItem(STORAGE_KEY)
	} catch {
		return null
	}
	if (!stored) return null
	return viewsFor(isMobile).includes(stored) ? (stored as CalendarViewRoute) : null
}
