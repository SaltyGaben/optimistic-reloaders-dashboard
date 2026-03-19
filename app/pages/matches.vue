<script setup lang="ts">
import { today, getLocalTimeZone  } from '@internationalized/date'


const { useMatchHistory } = useMatch()



const { data: matchHistory, isPending } = useMatchHistory(today(getLocalTimeZone()).toString())
</script>

<template>
	<div v-if="isPending">
		<UIcon name="i-lucide-loader" class="size-7 animate-spin" />
		<h1>Loading...</h1>
	</div>
	<div v-else class="grid grid-cols-2 gap-4">
		<MatchHistory v-for="match in matchHistory" :key="match._id" :match="match"/>
	</div>
</template>