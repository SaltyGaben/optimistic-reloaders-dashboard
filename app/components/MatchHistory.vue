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
						<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
							Match
						</p>
						<h1 class="mt-1 text-2xl font-semibold text-slate-50">
							{{ match.opponent || 'Motståndare ej satt' }}
						</h1>
					</div>
					<EditMatchModal v-if="userStore.isAdmin" :match="match"/>
				</div>
			</template>
			<div class="space-y-6">
				<p class="text-lg uppercase tracking-[0.2em] text-slate-100">
					Information
				</p>
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
							Datum
						</p>
						<p class="font-medium text-slate-100">
							{{ match.date || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
							Tid
						</p>
						<p class="font-medium text-slate-100">
							{{ match.time || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
							Motståndare
						</p>
						<p class="font-medium text-slate-100 ">
							{{ match.opponent || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
							Spelare
						</p>
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
				<USeparator />
				<p class="text-lg uppercase tracking-[0.2em] text-slate-100">
					Resultat
				</p>
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
							CGI rundor
						</p>
						<p class="font-medium text-slate-100">
							{{ match.result?.cgiScore || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
							{{ match.opponent }} rundor
						</p>
						<p class="font-medium text-slate-100">
							{{ match.result?.opponentScore || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
							Map
						</p>
						<p class="font-medium text-slate-100">
							{{ match.result?.map || 'Inte satt' }}
						</p>
					</div>

					<div class="space-y-1">
						<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
							Replay länk
						</p>
						<p v-if="!match.result?.replayLink" class="font-medium text-slate-100">
							Ingen replay länk finns
						</p>
						<NuxtLink v-else :to="match.result.replayLink">Replay länk</NuxtLink>
					</div>
				</div>
			</div>
		</UCard>
	</div>
</template>