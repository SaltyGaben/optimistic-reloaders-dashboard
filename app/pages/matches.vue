<script setup lang="ts">
import { today, getLocalTimeZone  } from '@internationalized/date'

const { useMatchHistory } = useMatch()

const { data: matchHistory, isPending } = useMatchHistory(today(getLocalTimeZone()).toString())

watch(matchHistory, () => {

	//console.log("data: ", matchHistory.value?.reverse())
})

</script>

<template>
	<div v-if="isPending" class="flex flex-col items-center justify-center h-screen">
		<UIcon name="i-lucide-loader" class="size-8 animate-spin" />
		<h1 class="text-2xl font-bold">Laddar matchhistorik...</h1>
	</div>
	<div v-else class="columns-2 gap-4">
		<MatchHistory
			v-for="match in (matchHistory ? [...matchHistory].reverse() : [])"
			:key="match._id"
			:match="match"
			class="mb-4 break-inside-avoid"
		/>
	</div>
</template>