<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const router = useRouter()

const baseItems: NavigationMenuItem[] = [
	{
		label: 'Dashboard',
		icon: 'i-lucide-layout-dashboard',
		to: '/dashboard',
	},
	{
		label: 'Calendar',
		icon: 'i-lucide-calendar-days',
		to: '/dashboard/calendar',
	},
	{
		label: 'Standings',
		icon: 'i-lucide-trophy',
		to: '/dashboard/standings',
	},
	{
		label: 'Results',
		icon: 'i-lucide-flag',
		to: '/dashboard/results',
	},
	{
		label: 'Incidents',
		icon: 'i-lucide-triangle-alert',
		to: '/dashboard/incidents',
	},
]

const menuItems = computed(() => {
	const items = [...baseItems]
	return items
})

const isLoaded = ref(true)

</script>

<template>
	<UDashboardGroup>
		<UDashboardSidebar
			collapsible
			resizable
			:ui="{
				footer: 'border-t border-default flex-row',
				header: 'justify-between',
			}"
			:default-size="20"
			:min-size="16"
			:max-size="20"
		>
			<template #header="{ collapsed }">
				<h1 v-if="!collapsed">Dashboard</h1>
				<UDashboardSidebarCollapse />
			</template>

			<template #default="{ collapsed }">
				<UNavigationMenu
					:collapsed="collapsed"
					:items="menuItems"
					orientation="vertical"/>
			</template>

			<template #footer="">
				<div v-if="!isLoaded" class="flex gap-2">
					<USkeleton class="size-7 rounded-full" />
					<h1>Loading...</h1>
				</div>
				<div class="flex gap-2">
					<h1>name</h1>
				</div>
			</template>
		</UDashboardSidebar>
		<UDashboardPanel class="p-6 overflow-y-scroll">
			<slot />
		</UDashboardPanel>
	</UDashboardGroup>
</template>
