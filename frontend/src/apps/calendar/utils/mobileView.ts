import { Columns3, Grid3x3, Rows3, SquareSquare } from 'lucide-vue-next'

/**
 * The four views the phone has — one day at a time, the week, the month, and an
 * agenda, which is home.
 *
 * Named in one place because four surfaces have to agree on them: the switcher
 * sheet that lists them, the tab bar that names the one you are on, the view
 * itself, and the route each is written to. Mail does the same with its folders.
 */
export type MobileView = 'agenda' | 'day' | 'week' | 'month'

/**
 * In the order the desktop's own switcher lists them — day, week, month, agenda
 * — so a view sits in the same place on either device. Home leading was a second
 * ordering to learn for the same four words.
 */
export const MOBILE_VIEWS: MobileView[] = ['day', 'week', 'month', 'agenda']

// The icons the desktop's switcher marks the same views with, so a view is the
// same thing to look for on either device — a day's own frame, a set of columns,
// a grid of days, a stack of rows.
export const viewIcon = (view: MobileView) =>
	view === 'month'
		? Grid3x3
		: view === 'week'
			? Columns3
			: view === 'day'
				? SquareSquare
				: Rows3

export const viewLabel = (view: MobileView) =>
	view === 'month'
		? __('Month')
		: view === 'week'
			? __('Week')
			: view === 'day'
				? __('Day')
				: __('Agenda')

/**
 * The route a view is written to, and the view a route names.
 *
 * The URL is the source of truth for which view is up — switching is a
 * navigation, so Back retraces it — which means every surface that reads or
 * writes the view goes through this pair rather than testing route names of its
 * own. The phone's agenda used to live on the day route, from when those were
 * the only two views it had; a day view of its own is what gives each of them
 * the route it is named after.
 */
const VIEW_ROUTES: Record<MobileView, string> = {
	agenda: 'calendar-agenda',
	day: 'calendar-day',
	week: 'calendar-week',
	month: 'calendar-month',
}

export const routeForView = (view: MobileView) => VIEW_ROUTES[view]

/** The view a route name draws on a phone; anything else is home. */
export const viewForRoute = (name: unknown): MobileView =>
	(Object.keys(VIEW_ROUTES) as MobileView[]).find(
		(view) => VIEW_ROUTES[view] === name,
	) ?? 'agenda'
