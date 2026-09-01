<template>
	<!-- The view switcher, reached from the header's hamburger or a re-tap of the
	     Calendar tab — where mail's folder sheet is reached from its hamburger or a
	     re-tap of the Mail tab. Same sheet, same rows, same metrics: which list you
	     are looking at is the same question in both apps. -->
	<!-- Untitled: two rows, each naming itself, so a heading over them would only
	     repeat what the sheet plainly is. -->
	<BottomSheet v-model:open="isViewSheetOpen">
		<!-- BottomSheet provides the scroll container; this div only pads the content,
		     including the home-indicator safe area. -->
		<div class="px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
			<button
				v-for="view in MOBILE_VIEWS"
				:key="view"
				:class="rowClass(view === currentView)"
				@click="select(view)"
			>
				<component
					:is="viewIcon(view)"
					class="text-ink-gray-6 h-[18px] w-[18px] shrink-0"
				/>
				<span class="flex-1 truncate text-left">{{ viewLabel(view) }}</span>
			</button>
		</div>
	</BottomSheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BottomSheet } from 'frappe-ui'

import dayjs from '@/apps/calendar/utils/dayjs'
import { useViewSheet } from '@/apps/calendar/composables/useViewSheet'
import { MOBILE_VIEWS, viewIcon, viewLabel } from '@/apps/calendar/utils/mobileView'
import { userStore } from '@/apps/calendar/stores/user'

import type { MobileView } from '@/apps/calendar/utils/mobileView'

const route = useRoute()
const router = useRouter()
const store = userStore()
const { isViewSheetOpen, closeViewSheet } = useViewSheet()

const currentView = computed<MobileView>(() =>
	route.name === 'calendar-month' ? 'month' : 'agenda',
)

/** A route without a date means today, the way the view writes it. */
const routeDate = () => {
	const { year, month, day } = route.params
	const date = year && month && day ? dayjs(`${year}-${month}-${day}`, 'YYYY-M-D') : dayjs()
	return date.isValid() ? date : dayjs()
}

// The URL is the source of truth for the view, so switching is a navigation, not
// a flag handed to the view — and Back retraces it, as it does on the desktop.
// The day stays put: the month you open is the one the agenda was on.
const select = (view: MobileView) => {
	closeViewSheet()
	if (view === currentView.value) return

	const day = routeDate()
	router.push({
		name: view === 'month' ? 'calendar-month' : 'calendar-day',
		params: {
			accountId: store.accountId,
			year: String(day.year()),
			month: String(day.month() + 1),
			day: String(day.date()),
		},
		query: route.query,
	})
}

const rowClass = (active: boolean) =>
	[
		'flex w-full items-center gap-3 rounded-6 px-3 py-2.5 text-base text-ink-gray-8',
		active ? 'bg-surface-gray-2 !font-semibold' : 'active:bg-surface-gray-1',
	].join(' ')
</script>
