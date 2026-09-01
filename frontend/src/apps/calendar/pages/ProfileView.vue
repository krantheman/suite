<template>
	<!--
	  Profile as a page, the way mail's is — one of the tab bar's destinations rather
	  than a dialog over whatever was behind it. The settings that used to be reachable
	  only through the desktop dialog are this page's contents, so the tab lands
	  somewhere instead of covering something.
	-->
	<div class="relative flex h-full min-h-0 flex-col">
		<header class="flex h-14 shrink-0 items-center border-b px-4">
			<h1 class="text-xl font-medium text-ink-gray-9">{{ __('Profile') }}</h1>
		</header>

		<!-- space-y, not a flex column with a gap: flex items in a scroller compress to
		     fit before the scroller ever scrolls. -->
		<div
			class="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3"
		>
			<!-- The identity card is the screen's subject, so it stands outside the groups
			     and opens the Profile tab the list no longer carries. -->
			<button
				v-if="profileTab"
				class="active:bg-surface-gray-1 flex w-full items-center gap-3.5 rounded-6 px-1 py-3.5"
				@click="openTab(profileTab)"
			>
				<Avatar :label="fullName" :image="user?.data?.user_image" size="2xl" class="size-14" />
				<div class="min-w-0 flex-1 text-left">
					<div class="text-ink-gray-9 truncate text-md !font-semibold">{{ fullName }}</div>
					<div class="text-ink-gray-5 mt-0.5 truncate text-sm">{{ loginId }}</div>
				</div>
				<ChevronRight class="text-ink-gray-4 size-4 shrink-0" />
			</button>

			<!-- Accounts: tap to switch, as the sidebar's account submenu does on desktop. -->
			<MobileSettingsCard v-if="accounts.length > 1" :label="__('Accounts')">
				<MobileSettingsRow
					v-for="account in accounts"
					:key="account.id"
					:label="account._name"
					:chevron="false"
					@click="switchAccount(account.id)"
				>
					<template #leading>
						<Avatar :label="account._name" size="md" />
					</template>
					<template #trailing>
						<Check v-if="account.id === store.accountId" class="text-ink-gray-6 size-4 shrink-0" />
					</template>
				</MobileSettingsRow>
			</MobileSettingsCard>

			<MobileSettingsCard v-for="group in groups" :key="group.label" :label="group.label">
				<MobileSettingsRow
					v-for="tab in group.items"
					:key="tab.value"
					:icon="tab.icon"
					:label="tab.label"
					@click="openTab(tab)"
				/>
			</MobileSettingsCard>

			<!-- Its own card: the destructive row is kept apart from the rest. -->
			<MobileSettingsCard>
				<MobileSettingsRow
					:icon="LogOut"
					:label="__('Log Out')"
					theme="red"
					:chevron="false"
					@click="showLogoutConfirm = true"
				/>
			</MobileSettingsCard>
		</div>

		<MobileSettingsSubPage :tab="activeTab" @close="closeTab" />

		<!-- The row rests at the bottom of a scroll rather than behind a deliberate
		     gesture, so it asks first. -->
		<Dialog
			v-model:open="showLogoutConfirm"
			v-bind="{
				title: __('Log Out'),
				message: __('Are you sure you want to log out?'),
				icon: { name: 'lucide-alert-triangle', theme: 'amber' },
				actions: [{ label: __('Log Out'), theme: 'red', onClick: logout.submit }],
			}"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check, ChevronRight, LogOut } from 'lucide-vue-next'
import { Avatar, Dialog } from 'frappe-ui'

import { useSessionStore } from '@/boot/session'
import { userStore } from '@/apps/calendar/stores/user'
import { useSettingsTabs, type SettingsTab } from '@/apps/calendar/composables/useSettingsTabs'
// The three shells are mail's — a settings card, its rows, and the pushed page a row
// opens. They carry no mail in them, and a second copy under calendar/ would only be
// the same geometry drifting apart. Mail already borrows the calendar's event panel
// the same way.
import MobileSettingsCard from '@/apps/mail/components/mobile/MobileSettingsCard.vue'
import MobileSettingsRow from '@/apps/mail/components/mobile/MobileSettingsRow.vue'
import MobileSettingsSubPage from '@/apps/mail/components/mobile/MobileSettingsSubPage.vue'

const user = inject('$user') as { data?: Record<string, any> } | undefined

const route = useRoute()
const router = useRouter()
const store = userStore()
const { logout } = useSessionStore()

// Profile leaves the list — the identity card above it opens that tab instead.
const { groups, findTab } = useSettingsTabs(['profile'])
const profileTab = computed(() => findTab('profile'))

// Which sub-page is open lives in the URL (?tab=appearance) rather than in a local
// ref, so the back gesture closes it and re-tapping the Profile tab can pop back to
// the page root by dropping the query.
const activeTab = computed<SettingsTab | null>(
	() => (route.query.tab ? findTab(String(route.query.tab)) : null) ?? null,
)
const openTab = (tab?: SettingsTab) => tab && router.push({ query: { tab: tab.value } })
const closeTab = () => router.replace({ query: {} })

const showLogoutConfirm = ref(false)

const accounts = computed(() => store.userResource?.data?.accounts ?? [])

const switchAccount = (accountId: string) => {
	if (accountId === store.accountId) return
	router.push({ name: route.name!, params: { ...route.params, accountId }, query: route.query })
}

const fullName = computed(() => user?.data?.full_name ?? '')
// The login id, not the active account: the card is who you are signed in as, and the
// accounts — any of which could be active — are the list right below it.
const loginId = computed(() => user?.data?.name ?? '')
</script>
