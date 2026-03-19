<script setup lang="ts">
import NextMatch from "~/components/NextMatch.vue"
import type { Doc, Id } from "~~/convex/_generated/dataModel"
import { today, getLocalTimeZone  } from '@internationalized/date'

const { handleReadyCheck, useNextMatchQuery, useMatchesForMonthQuery } = useMatch()
const userStore = useUserStore()

const todayIso = today(getLocalTimeZone()).toString()

const { data: rawNextMatch } = useNextMatchQuery(todayIso)
const nextMatch = computed<Doc<"matchDay"> | undefined>(() => rawNextMatch.value ?? undefined)

const currentYear = ref<number>(Number(todayIso.split("-")[0]))
const currentMonth = ref<number>(Number(todayIso.split("-")[1]))

const { data: matchDays } = useMatchesForMonthQuery(currentYear, currentMonth)

const selectedDate = ref<string | undefined>(undefined)

const onMonthChange = async (payload: { year: number; month: number }) => {
	selectedDate.value = undefined
	currentYear.value = payload.year
	currentMonth.value = payload.month
}

const selectedMatch = computed(() => {
	const match = matchDays.value?.find(m => m.date === selectedDate.value)

	if (match) {
		return match
	}
	
	return undefined
})

const handleReady = async (payload: { isReady: boolean; matchId: Id<'matchDay'> }) => {
	const userId = userStore.currentUser?.externalId
	if (!userId) return

	await handleReadyCheck(payload.isReady, payload.matchId, userId)
}

onMounted(() => {
	selectedDate.value = today(getLocalTimeZone()).toString()
})
</script>

<template>
	<div class="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
		<NextMatch :match="nextMatch" :date="nextMatch?.date" @ready="handleReady"/>
		<div class="flex flex-col gap-6">
			<header class="space-y-2">
				<h1 class="text-4xl font-semibold tracking-tight">
					Match kalender
				</h1>
				<p class="text-sm text-slate-400">
					Här kan du se alla matcher som ska spelas och information om dem
				</p>
			</header>

			<MatchCalendar
				v-model="selectedDate"
				:match-days="matchDays"
				@month-change="onMonthChange"
			/>

			<NextMatch :match="selectedMatch" :date="selectedDate" @ready="handleReady"/>
		</div>
	</div>
</template>