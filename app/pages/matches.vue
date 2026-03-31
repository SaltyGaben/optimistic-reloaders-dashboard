<script setup lang="ts">
import { today, getLocalTimeZone  } from '@internationalized/date'

const { useMatchHistory, sortMatches } = useMatch()

const { data: matchHistory, isPending } = useMatchHistory(today(getLocalTimeZone()).toString())

</script>

<template>
	<div v-if="isPending" class="flex flex-col items-center justify-center h-screen">
		<UIcon name="i-lucide-loader" class="size-8 animate-spin" />
		<h1 class="text-2xl font-bold">Laddar matchhistorik...</h1>
	</div>
	<div v-else class="grid grid-cols-2 gap-4">
		<MatchHistory
			v-for="match in sortMatches(matchHistory ?? [], 'latest')"
			:key="match._id"
			:match="match"
		/>
	</div>
</template>