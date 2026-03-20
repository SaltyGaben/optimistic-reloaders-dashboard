<script setup lang="ts">
import { api } from '~~/convex/_generated/api'

const { data: players, isPending } = useConvexQuery(api.users.getAllUsers)

</script>

<template>
	<div v-if="isPending" class="flex flex-col items-center justify-center h-screen">
		<UIcon name="i-lucide-loader" class="size-8 animate-spin" />
		<h1 class="text-2xl font-bold">Laddar spelare...</h1>
	</div>
	<div v-else class="grid grid-cols-2 gap-4">
		<PlayerCard v-for="player in players" :key="player.externalId" :player="player"/>
	</div>
</template>