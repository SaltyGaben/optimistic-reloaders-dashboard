<script setup lang="ts">
import type { FormSchema, FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'
import { ShirtSizes } from '~/types/shirtSizes'
import type { Doc } from '~~/convex/_generated/dataModel'

type User = Doc<'users'>

const props = defineProps<{
	player: User
}>()

const { updatePlayer } = usePlayer()
const toast = useToast()

const shirtSizes = Object.values(ShirtSizes).map((v) => v.toString())
const open = ref(false)

const playerSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	steamId: z.string(),
	shirtSize: z.string(),
})

export type PlayerSchema = z.infer<typeof playerSchema>

const playerState = reactive({
	firstName: '',
	lastName: '',
	steamId: '',
	shirtSize: ''
})

watch(open, (val) => {
	if(val) {
		playerState.firstName = props.player.firstName ?? ''
		playerState.lastName = props.player.lastName ?? ''
		playerState.steamId = props.player.steamId ?? ''
		playerState.shirtSize = props.player.shirtSize ?? ''
	}
}, { immediate: true })

const onSubmit = async(event: FormSubmitEvent<FormSchema>) => {
	try {
		await updatePlayer(event.data, props.player._id)

		toast.add({
			title: 'Match sparad',
			description: `Du har sparat informationen för matchen`,
			icon: 'i-lucide-circle-check-big',
			color: 'success'
		})

		open.value = false
	} catch {
		toast.add({
			title: 'Något gick fel',
			description: `Något gick fel vid sparning av matchen`,
			icon: 'i-lucide-circle-alert',
			color: 'error'
		})
	}
}
</script>

<template>
	<UForm :state="playerState" :schema="playerSchema" @submit.prevent="onSubmit">
		<UModal
			v-model:open="open"	
			title="Redigera spelare"
			description="Här kan du redigera information om spelare"
			:ui="{ title: 'text-2xl font-semibold' }"
			:portal="false">
			<UTooltip text="Redigera spelare">
				<UButton
					icon="i-lucide-pencil"
					size="sm"
					variant="ghost"
					color="primary" />
			</UTooltip>
			<template #body>
				<div class="flex flex-col gap-4">
					<div>
						<h1 class="text-lg uppercase tracking-[0.2em] mb-2">Spelar information</h1>
					
						<div class="grid grid-cols-2 gap-4">
							<UFormField label="Förnamn" name="firstName">
								<UInput v-model="playerState.firstName" placeholder="Förnamn" class="w-full"/>
							</UFormField>

							<UFormField label="Efternamn" name="lastName">
								<UInput v-model="playerState.lastName" placeholder="Efternamn" class="w-full"/>
							</UFormField>

							<UFormField label="Steam ID" name="steamId">
								<UInput v-model="playerState.steamId" placeholder="Steam ID" class="w-full"/>
							</UFormField>

							<UFormField label="Tröjstorlek" name="shirtSize">
								<USelectMenu
									v-model="playerState.shirtSize"
									:items="shirtSizes"
									placeholder="Tröjstorlek"
									class="w-full"/>
							</UFormField>
						</div>
					</div>
				</div>
			</template>
			<template #footer="{ close }">
				<UButton
					label="Avbryt"
					color="neutral"
					variant="outline"
					@click="close" />
				<UButton
					label="Spara"
					color="primary"
					variant="subtle"
					type="submit" />
			</template>
		</UModal>
	</UForm>
</template>