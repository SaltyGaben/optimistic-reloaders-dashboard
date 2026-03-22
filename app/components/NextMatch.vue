<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Doc, Id } from '~~/convex/_generated/dataModel'

type MatchDay = Doc<'matchDay'>

const props = defineProps<{
	match: MatchDay | undefined,
	date: string | undefined
}>()

const emit = defineEmits<{
	ready: [value: { isReady: boolean, matchId: Id<'matchDay'>}]
}>()

const userStore = useUserStore()

const pendingReady = ref<boolean | null>(null)

const derivedIsReady = computed(() => {
	const userId = userStore.currentUser?._id
	const matchReadyPlayers = props.match?.readyPlayers ?? []

	if (!userId) return false

	return matchReadyPlayers.some((p) => p.userId === userId)
})

const isReady = computed(() => pendingReady.value ?? derivedIsReady.value)

const handleReady = (value: boolean) => {
	if(props.match) {
		if (isReady.value === value) return
		pendingReady.value = value
		emit('ready', { isReady: value, matchId: props.match?._id })
	}
}

watch(
	() => derivedIsReady.value,
	(next) => {
		if (pendingReady.value !== null && pendingReady.value === next) {
			pendingReady.value = null
		}
	},
	{ immediate: true }
)
</script>

<template>
	<UCard
		v-if="match"
		class="w-full shadow-xl"
	>
		<template #header>
			<div class="flex items-center justify-between gap-3">
				<div>
					<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
						Nästa match
					</p>
					<h1 class="mt-1 text-2xl font-semibold text-slate-50">
						{{ match.opponent || 'Motståndare ej satt' }}
					</h1>
				</div>
				<UBadge
					color="primary"
					variant="subtle"
					class="text-xs font-medium"
				>
					Säsong {{ match.season }}
				</UBadge>
			</div>
		</template>

		<div class="space-y-6">
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
					<p class="font-medium text-slate-100">
						{{ match.opponent || 'Inte satt' }}
					</p>
				</div>

				<div class="space-y-1">
					<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
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
							<img :src="user.imageUrl" alt="Spelar ikon" class="rounded-full size-10">
						</UTooltip>
					</div>
				</div>
			</div>

			<div
				class="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-full"
						:class="isReady ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'"
					>
						<UIcon
							:name="isReady ? 'i-lucide-circle-check-big' : 'i-lucide-circle-question-mark'"
							class="h-5 w-5"
						/>
					</div>
					<div>
						<p class="text-xs uppercase tracking-[0.2em] text-slate-400">
							Tillgänglighet
						</p>
						<p
							class="text-sm font-medium"
							:class="isReady ? 'text-emerald-300' : 'text-amber-200'"
						>
							{{ isReady ? 'Du är markerad som redo' : 'Du är inte markerad som redo' }}
						</p>
						<p class="mt-0.5 text-xs text-slate-400">
							Kan du spela den här matchen?
						</p>
					</div>
				</div>

				<div class="flex gap-2">
					<UButton
						label="Ja, jag är redo"
						color="success"
						:variant="isReady ? 'solid' : 'outline'"
						class="min-w-32 justify-center text-sm"
						@click="handleReady(true)"
					/>
					<UButton
						label="Nej"
						color="error"
						:variant="!isReady ? 'solid' : 'outline'"
						class="min-w-20 justify-center text-sm"
						@click="handleReady(false)"
					/>
				</div>
			</div>
		</div>
	</UCard>
	<UCard v-if="!match && date">
		<h1 class="mt-1 text-2xl font-semibold text-slate-50">Det finns ingen match för denna dagen: {{ date }}</h1>
	</UCard>
</template>