<script setup lang="ts">
import type { Doc } from '~~/convex/_generated/dataModel'

const { currentUser, isAdmin } = useUserStore()

type User = Doc<'users'>

const props = defineProps<{
	player: User
}>()

const showEditButton = computed(() => {
	if (currentUser) {
		return isAdmin ? true : props.player.externalId === currentUser.externalId
	}

	return false
})

</script>

<template>
	<UCard>
		<template #header>
			<div class="flex flex-row justify-between ">
				<div class="flex flex-row gap-4 items-center">
					<h1 class="text-2xl uppercase tracking-[0.2em] items-center">{{ player.username }}</h1>
					<img :src="player.avatarUrl" alt="Spelar ikon" class="rounded-full size-12">
				</div>
				<EditPlayerModal v-if="showEditButton" :player="player"/>
			</div>
		</template>
		<div class="space-y-6">
			<p class="text-lg uppercase tracking-[0.2em] text-default">
				Information
			</p>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div class="space-y-1">
					<p class="text-xs uppercase tracking-[0.2em] text-muted">
						Förnamn
					</p>
					<p class="font-medium text-default">
						{{ player.firstName || 'Inte satt' }}
					</p>
				</div>

				<div class="space-y-1">
					<p class="text-xs uppercase tracking-[0.2em] text-muted">
						Efternamn
					</p>
					<p class="font-medium text-default">
						{{ player.lastName || 'Inte satt' }}
					</p>
				</div>

				<div class="space-y-1">
					<p class="text-xs uppercase tracking-[0.2em] text-muted">
						Fullt namn
					</p>
					<p class="font-medium text-default">
						{{ player.fullName || 'Inte satt' }}
					</p>
				</div>

				<div class="space-y-1">
					<p class="text-xs uppercase tracking-[0.2em] text-muted">
						Steam ID
					</p>
					<p class="font-medium text-default">
						{{ player.steamId || 'Inte satt' }}
					</p>
				</div>

				<div class="space-y-1">
					<p class="text-xs uppercase tracking-[0.2em] text-muted">
						Tröjstorlek
					</p>
					<p class="font-medium text-default">
						{{ player.shirtSize || 'Inte satt' }}
					</p>
				</div>
			</div>
		</div>
	</UCard>
</template>