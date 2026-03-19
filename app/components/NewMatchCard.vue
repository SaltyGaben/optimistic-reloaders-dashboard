<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { getLocalTimeZone, today } from '@internationalized/date'
import z from 'zod'

const toast = useToast()
const { saveNewMatch } = useMatch() 

const inputDate = useTemplateRef('inputDate')
const dateValue = shallowRef(today(getLocalTimeZone()))

const schema = z.object({
	opponent: z.string().min(5, "Motståndare måste ha ett värde eller vara längre än 4 karaktärer"),
	date: z.string().min(1, "Datum måste ha ett värde"),
	time: z.string().min(0, "Tid måste ha ett värde"),
	season: z.number().min(1, "Säsong måste ha ett värde eller vara störra än 0"),
})

export type MatchSchema = z.infer<typeof schema>

const state = reactive({
	opponent: '',
	date: '',
	time: '',
	season: 0
})

watch(dateValue, (val) => {
	state.date = val ? val.toString() : ''
}, { immediate: true })

const onSubmit = async (event: FormSubmitEvent<MatchSchema>) => {
	try {
		await saveNewMatch(event.data)

		toast.add({
			title: 'Match sparad',
			description: `Du har sparat en match mot ${event.data.opponent}, med datum: ${event.data.date} kl. ${event.data.time}`,
			icon: 'i-lucide-circle-check-big',
			color: 'success'
		})
	} catch (e) {
		toast.add({
			title: 'Något gick fel',
			description: `Något gick fel vid sparning av matchen mot ${event.data.opponent}`,
			icon: 'i-lucide-circle-alert',
			color: 'error'
		})
	}
}

</script>

<template>
	<UForm :schema="schema" :state="state" @submit="onSubmit">
		<UCard>
			<template #header>
				<h1>Skapa ny match</h1>
			</template>
			<div class="grid grid-cols-4 gap-4">
				<UFormField label="Motståndare" name="opponent">
					<UInput v-model="state.opponent" placeholder="Motståndare"/>
				</UFormField>

				<UFormField label="Datum" name="date">
					<UInputDate ref="inputDate" v-model="dateValue" :range="false">
						<template #trailing>
							<UPopover :reference="inputDate?.inputsRef[3]?.$el">
								<UButton
									color="neutral"
									variant="link"
									size="sm"
									icon="i-lucide-calendar"
									aria-label="Select a date"
									class="px-0"
								/>

								<template #content>
									<UCalendar v-model="dateValue" class="p-2" />
								</template>
							</UPopover>
						</template>
					</UInputDate>
				</UFormField>

				<UFormField label="Tid" name="time">
					<UInputTime :hour-cycle="24"/>
				</UFormField>

				<UFormField label="Säsong" name="season" class="w-30">
					<UInputNumber v-model="state.season" :min="0"/>
				</UFormField>
			</div>
			<template #footer>
				<UButton type="submit" label="Submit" color="success"/>
			</template>
		</UCard>
	</UForm>
</template>