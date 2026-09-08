import { Grid3x3, Rows3 } from 'lucide-vue-next'

/**
 * The two views the phone has — an agenda, which is home, and the month.
 *
 * Named in one place because three surfaces have to agree on them: the switcher
 * sheet that lists them, the tab bar that names the one you are on, and the view
 * itself. Mail does the same with its folders.
 */
export type MobileView = 'agenda' | 'month'

/** In the order the switcher lists them: home first. */
export const MOBILE_VIEWS: MobileView[] = ['agenda', 'month']

// The same two the desktop's view switcher draws: each view marked by the shape of
// what it lays out — a grid of days, a stack of rows.
export const viewIcon = (view: MobileView) => (view === 'month' ? Grid3x3 : Rows3)

export const viewLabel = (view: MobileView) =>
	view === 'month' ? __('Month') : __('Agenda')
