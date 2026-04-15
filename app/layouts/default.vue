<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { UserButton } from '@clerk/vue'
import { api } from '~~/convex/_generated/api'

const router = useRouter()
const { isLoaded, user } = useUser()
const { data: currentUser } = useConvexQuery(api.users.current)

const baseItems: NavigationMenuItem[] = [
	{
		label: 'Hem',
		icon: 'i-lucide-house',
		to: '/dashboard'
	},
	{
		label: 'Match Historik',
		icon: 'i-lucide-history',
		to: '/matches',
	},
	{
		label: 'Spelare',
		icon: 'i-lucide-users',
		to: '/players',
	},
	{
		label: 'Länkar',
		icon: 'i-lucide-link',
		to: '/links',
	},
	{
		label: 'Statistik',
		icon: 'i-lucide-chart-column-big',
		to: '/statistics',
	},
]

const menuItems = computed(() => {
	const items = [...baseItems]

	if(currentUser.value?.role === 'admin') {
		items.push({
			label: 'Admin',
			icon: 'i-lucide-shield-user',
			to: '/admin',
		})
	}
	return items
})

const isAdmin = computed(() => {
	return false
})

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
			:min-size="20"
			:max-size="24"
		>
			<template #header="{ collapsed }">
				<h1 v-if="!collapsed"><span class="text-red-500 font-bold">CGI</span> Optimistic Reloaders</h1>
				<UDashboardSidebarCollapse />
			</template>

			<template #default="{ collapsed }">
				<UNavigationMenu
					:collapsed="collapsed"
					:items="menuItems"
					highlight
					orientation="vertical"/>
			</template>

			<template #footer="{ collapsed }">
				<ClientOnly>
					<div v-if="!isLoaded" class="flex gap-2">
						<USkeleton class="size-7 rounded-full" />
						<h1>Loading...</h1>
					</div>
					<div v-if="isLoaded && user" class="flex gap-2">
						<UserButton>
							<UserButton.MenuItems>
								<UserButton.Action label="Profile" @click="router.push(`/profile/${user?.id}`)">
									<template #labelIcon>
										<UIcon name="i-lucide-user" :size="16" />
									</template>
								</UserButton.Action>
								<UserButton.Action v-if="isAdmin" label="Admin" @click="router.push('/admin')">
									<template #labelIcon>
										<UIcon name="i-lucide-shield-user" :size="16" />
									</template>
								</UserButton.Action>
							</UserButton.MenuItems>
						</UserButton>
						<h1 v-if="!collapsed">{{ user.username ?? user.fullName }}</h1>
					</div>
				</ClientOnly>
			</template>
		</UDashboardSidebar>
		<UDashboardPanel class="p-6 overflow-y-scroll">
			<slot />
		</UDashboardPanel>
	</UDashboardGroup>
</template>
