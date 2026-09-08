import { CalendarAgendaIcon, CalendarMonthIcon } from 'frappe-ui/experimental'

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

// The calendar's own glyphs, the ones the desktop's view switcher draws. A month and
// an agenda are the same two views on either device, so they are marked by the same
// two marks rather than by whichever lucide icons came closest.
export const viewIcon = (view: MobileView) =>
	view === 'month' ? CalendarMonthIcon : CalendarAgendaIcon

export const viewLabel = (view: MobileView) =>
	view === 'month' ? __('Month') : __('Agenda')
