<script setup lang="ts">
import { getLocalTimeZone, today  } from '@internationalized/date'

const { useUpcomingMatches, sortMatches } = useMatch()

const { data: upcomingMatches }  = useUpcomingMatches(today(getLocalTimeZone()).toString())

</script>

<template>
	<div class="flex flex-col gap-6">
		<h1 class="text-3xl uppercase tracking-[0.2em]">Skapa ny match</h1>
		<NewMatchCard class="max-w-250"/>
		<USeparator />
		<h1 class="text-3xl uppercase tracking-[0.2em]">Redigera kommande matcher</h1>
		<div class="grid grid-cols-2 gap-4">
			<MatchHistory
				v-for="match in sortMatches(upcomingMatches ?? [], 'earliest')"
				:key="match._id"
				:match="match"
			/>
		</div>
	</div>
</template>