<script setup lang="ts">
import { useStatistics } from "~/composables/useStatistics"

const { useStatisticsQuery, mapLabel, percentageLabel } = useStatistics()
const { data: statistics, isPending } = useStatisticsQuery()

const mapTableColumns = [
	{ accessorKey: "map", header: "Karta" },
	{ accessorKey: "matches", header: "Matcher" },
	{ accessorKey: "record", header: "W-L" },
	{ accessorKey: "winRate", header: "Win rate" },
	{ accessorKey: "rounds", header: "Rounds (F-A)" },
	{ accessorKey: "roundDiff", header: "Round diff" },
]

const teamTableColumns = [
	{ accessorKey: "opponent", header: "Motståndare" },
	{ accessorKey: "matches", header: "Matcher" },
	{ accessorKey: "record", header: "W-L" },
	{ accessorKey: "winRate", header: "Win rate" },
	{ accessorKey: "rounds", header: "Rounds (F-A)" },
	{ accessorKey: "roundDiff", header: "Round diff" },
]

const overviewItems = computed(() => {
	if (!statistics.value) return []

	return [
		{ label: "Spelade matcher", value: statistics.value.overview.completedMatches },
		{ label: "Vinster", value: statistics.value.overview.wins },
		{ label: "Förluster", value: statistics.value.overview.losses },
		{ label: "Win rate", value: percentageLabel(statistics.value.overview.winRate) },
		{ label: "Rounds för", value: statistics.value.overview.roundsFor },
		{ label: "Rounds emot", value: statistics.value.overview.roundsAgainst },
		{ label: "Round diff", value: statistics.value.overview.roundDiff },
		{ label: "Snittscore (CGI)", value: statistics.value.overview.avgCgiScore },
		{ label: "Snittscore (motstånd)", value: statistics.value.overview.avgOpponentScore },
		{ label: "Jämna matcher", value: percentageLabel(statistics.value.overview.closeMatchRate) },
		{ label: "Stora segrar/förluster", value: percentageLabel(statistics.value.overview.blowoutRate) },
	]
})

const mapTableRows = computed(() => {
	if (!statistics.value) return []

	return statistics.value.mapStats.map((map) => ({
		map: mapLabel(map.map),
		matches: map.matches,
		record: `${map.wins}-${map.losses}`,
		winRate: percentageLabel(map.winRate),
		rounds: `${map.roundsFor}-${map.roundsAgainst}`,
		roundDiff: map.roundDiff,
	}))
})

const teamTableRows = computed(() => {
	if (!statistics.value) return []

	return statistics.value.teamStats.map((team) => ({
		opponent: team.opponent,
		matches: team.matches,
		record: `${team.wins}-${team.losses}`,
		winRate: percentageLabel(team.winRate),
		rounds: `${team.roundsFor}-${team.roundsAgainst}`,
		roundDiff: team.roundDiff,
	}))
})
</script>

<template>
	<UPage>
		<UPageHeader
			title="Statistik"
			description="Lagnivå statistik baserad på färdigspelade matcher."
		/>
		<UPageBody>
			<div v-if="isPending" class="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
				<UIcon name="i-lucide-loader" class="size-8 animate-spin text-primary" />
				<p class="text-sm text-muted">Laddar statistik...</p>
			</div>

			<div v-else-if="statistics" class="space-y-6">
				<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<UCard
						v-for="item in overviewItems"
						:key="item.label"
					>
						<div class="space-y-1">
							<p class="text-xs uppercase tracking-wide text-muted">
								{{ item.label }}
							</p>
							<p class="text-2xl font-semibold text-highlighted">
								{{ item.value }}
							</p>
						</div>
					</UCard>
				</div>

				<div class="grid gap-6 xl:grid-cols-2">
					<UCard>
						<template #header>
							<h2 class="text-lg font-semibold text-highlighted">
								Karthöjdpunkter
							</h2>
						</template>
						<div class="grid gap-3 sm:grid-cols-2">
							<div class="rounded-lg border border-default p-4">
								<div class="flex items-center justify-between gap-2">
									<p class="text-xs uppercase tracking-wide text-muted">Bästa karta</p>
									<UBadge
										label="Top"
										color="success"
										variant="soft"
										size="sm"
									/>
								</div>
								<p class="mt-2 text-lg font-semibold text-highlighted">
									{{ statistics.highlights.bestMap ? mapLabel(statistics.highlights.bestMap.map) : 'Inte tillräckligt med data' }}
								</p>
								<p v-if="statistics.highlights.bestMap" class="text-sm text-muted">
									{{ percentageLabel(statistics.highlights.bestMap.winRate) }} win rate ({{ statistics.highlights.bestMap.matches }} matcher)
								</p>
							</div>

							<div class="rounded-lg border border-default p-4">
								<div class="flex items-center justify-between gap-2">
									<p class="text-xs uppercase tracking-wide text-muted">Svåraste karta</p>
									<UBadge
										label="Tough"
										color="warning"
										variant="soft"
										size="sm"
									/>
								</div>
								<p class="mt-2 text-lg font-semibold text-highlighted">
									{{ statistics.highlights.worstMap ? mapLabel(statistics.highlights.worstMap.map) : 'Inte tillräckligt med data' }}
								</p>
								<p v-if="statistics.highlights.worstMap" class="text-sm text-muted">
									{{ percentageLabel(statistics.highlights.worstMap.winRate) }} win rate ({{ statistics.highlights.worstMap.matches }} matcher)
								</p>
							</div>
						</div>
					</UCard>

					<UCard>
						<template #header>
							<h2 class="text-lg font-semibold text-highlighted">
								Säsongsöversikt
							</h2>
						</template>
						<div class="space-y-2">
							<div
								v-for="season in statistics.seasonStats"
								:key="season.season"
								class="flex items-center justify-between rounded-lg border border-default px-3 py-2"
							>
								<div>
									<p class="font-medium text-highlighted">Säsong {{ season.season }}</p>
									<p class="text-xs text-muted">
										{{ season.matches }} matcher, {{ season.wins }}-{{ season.losses }}
									</p>
									<UProgress
										:model-value="season.winRate"
										:max="100"
										color="primary"
										size="xs"
										class="mt-2 w-40"
									/>
								</div>
								<div class="text-right">
									<p class="font-semibold text-highlighted">{{ percentageLabel(season.winRate) }}</p>
									<UBadge
										:label="`Round diff ${season.roundDiff}`"
										:color="season.roundDiff >= 0 ? 'success' : 'error'"
										variant="soft"
										size="sm"
									/>
								</div>
							</div>
						</div>
					</UCard>
				</div>

				<UCard>
					<template #header>
						<h2 class="text-lg font-semibold text-highlighted">
							Prestation per karta
						</h2>
					</template>
					<UTable
						:data="mapTableRows"
						:columns="mapTableColumns"
						class="min-w-[640px]"
					/>
				</UCard>

				<UCard>
					<template #header>
						<h2 class="text-lg font-semibold text-highlighted">
							Prestation mot lag
						</h2>
					</template>
					<UTable
						:data="teamTableRows"
						:columns="teamTableColumns"
						class="min-w-[640px]"
					/>
				</UCard>
			</div>
		</UPageBody>
	</UPage>
</template>
