<script setup lang="ts">
import type { Doc } from '~~/convex/_generated/dataModel'

const userStore = useUserStore()

type MatchDay = Doc<'matchDay'>

defineProps<{
	match: MatchDay
}>()

</script>

<template>
	<div>
		<UCard class="h-full">
			<template #header>
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="text-xs uppercase tracking-[0.2em] text-muted">
							Match
						</p>
						<h1 class="mt-1 text-2xl font-semibold text-highlighted">
							{{ match.opponent || 'Motståndare ej satt' }}
						</h1>
					</div>
					<EditMatchModal v-if="userStore.isAdmin" :match="match"/>
				</div>
			</template>
			<div class="space-y-6">
				<p class="text-lg uppercase tracking-[0.2em] text-default">
					Information
				</p>
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-muted">
							Datum
						</p>
						<p class="font-medium text-default">
							{{ match.date || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-muted">
							Tid
						</p>
						<p class="font-medium text-default">
							{{ match.time || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-muted">
							Motståndare
						</p>
						<p class="font-medium text-default">
							{{ match.opponent || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-muted">
							Spelare
						</p>
						<div class="h-10 flex flex-row gap-2">
							<UTooltip
								v-for="user in match.readyPlayers"
								:key="user.userId"
								:text="user.username"
								:delay-duration="0"
								arrow
								:ui="{
									content: 'p-4',
									text: 'text-sm'
								}">
								<img :src="user.imageUrl" alt="Spelar ikon" class="rounded-full size-8">
							</UTooltip>
						</div>
					</div>
				</div>
				<USeparator />
				<p class="text-lg uppercase tracking-[0.2em] text-default">
					Resultat
				</p>
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-muted">
							CGI rundor
						</p>
						<p class="font-medium text-default">
							{{ match.result?.cgiScore || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-muted">
							{{ match.opponent }} rundor
						</p>
						<p class="font-medium text-default">
							{{ match.result?.opponentScore || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-muted">
							Map
						</p>
						<p class="font-medium text-default">
							{{ match.result?.map || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-muted">
							Replay länk
						</p>
						<p v-if="!match.result?.replayLink" class="font-medium text-default">
							Ingen replay länk finns
						</p>
						<NuxtLink v-else :to="match.result.replayLink">Replay länk</NuxtLink>
					</div>
				</div>
			</div>
		</UCard>
	</div>
</template>