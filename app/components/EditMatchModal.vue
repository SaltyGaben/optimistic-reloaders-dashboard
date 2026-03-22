<script setup lang="ts">
import type { FormSubmitEvent, SelectMenuItem } from '@nuxt/ui'
import { getLocalTimeZone, today, Time  } from '@internationalized/date'
import z from 'zod'
import type { Doc } from '~~/convex/_generated/dataModel'
import { Maps } from '~/types/maps'

type MatchDay = Doc<'matchDay'>

const props = defineProps<{
	match: MatchDay
}>()

const toast = useToast()
const { updateMatch } =useMatch()

const inputDate = useTemplateRef('inputDate')
const dateValue = shallowRef(today(getLocalTimeZone()))
const timeValue = shallowRef(new Time(19, 0))
const mapOptions = Object.values(Maps).map(m => ({ label: m, id: m })) as SelectMenuItem[]
const open = ref(false)

const resultObjectSchema = z.object({
	map: z.string().min(1, "Map måste ha ett värde"),
	cgiScore: z.number().min(1, "CGI score måste ha ett värde"),
	opponentScore: z.number().min(1, "Motståndarens poäng måste ha ett värde"),
	replayLink: z.optional(z.string()),
})

const matchResultSchema = z.object({
	opponent: z.string().min(5, "Motståndare måste ha ett värde eller vara längre än 4 karaktärer"),
	date: z.string().min(1, "Datum måste ha ett värde"),
	time: z.string().min(0, "Tid måste ha ett värde"),
	season: z.number().min(1, "Säsong måste ha ett värde eller vara störra än 0"),
	result: z.preprocess((val) => {
		if (!val) return undefined

		const obj = val as {
			map?: unknown
			cgiScore?: unknown
			opponentScore?: unknown
			replayLink?: unknown
		}

		const map = typeof obj.map === 'string' ? obj.map.trim() : ''
		const cgiScore = typeof obj.cgiScore === 'number' ? obj.cgiScore : Number(obj.cgiScore)
		const opponentScore = typeof obj.opponentScore === 'number' ? obj.opponentScore : Number(obj.opponentScore)
		const replayLink = typeof obj.replayLink === 'string' ? obj.replayLink.trim() : ''

		const isEmpty =
			map === '' &&
			(cgiScore === 0 || Number.isNaN(cgiScore)) &&
			(opponentScore === 0 || Number.isNaN(opponentScore)) &&
			replayLink === ''

		return isEmpty
			? undefined
			: { ...obj, map, cgiScore, opponentScore, replayLink }
	}, z.union([z.undefined(), resultObjectSchema])).optional(),
})

export type MatchResultSchema = z.infer<typeof matchResultSchema>

const matchState = reactive({
	opponent: '',
	date: '',
	time: '',
	season: 0,
	result: {
		map: '',
		cgiScore: 0,
		opponentScore: 0,
		replayLink: ''
	}
})

const setTimeFromString = (value: string) => {
	const [hours, minutes] = value.split(':').map(Number)
	timeValue.value = new Time(hours, minutes)
}

watch(dateValue, (val) => {
	matchState.date = val ? val.toString() : ''
}, { immediate: true })

watch(timeValue, (val) => {
	matchState.time = val ? val.toString().slice(0, 5) : ''
}, { immediate: true })

watch(open, (val) => {	
	if(val) {		
		matchState.opponent = props.match.opponent
		matchState.date = props.match.date
		matchState.time = props.match.time
		setTimeFromString(props.match.time)
		matchState.season = props.match.season

		if(props.match.result) {
			matchState.result.cgiScore = props.match.result?.cgiScore ?? 0
			matchState.result.opponentScore = props.match.result?.opponentScore ?? 0
			matchState.result.map = props.match.result?.map ?? ''
			matchState.result.replayLink = props.match.result?.replayLink ?? ''
		}

	}
}, { immediate: true })


const onSubmit = async (event: FormSubmitEvent<MatchResultSchema>) => {
	try {
		await updateMatch(event.data, props.match._id)

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
	<UModal
		v-model:open="open"
		title="Redigera match"
		description="Här kan du redigera matchinformation och resultat"
		:ui="{ title: 'text-2xl font-semibold' }">
		<UTooltip text="Redigera match">
			<UButton
				icon="i-lucide-pencil"
				size="sm"
				variant="ghost"
				color="primary" />
		</UTooltip>
		<template #body>
			<UForm
				:state="matchState"
				:schema="matchResultSchema"
				class="flex flex-col gap-4"
				@submit.prevent="onSubmit">
				<div class="flex flex-col gap-4">
					<div>
						<h1 class="text-lg uppercase tracking-[0.2em] mb-2">Match information</h1>
					
						<div class="grid grid-cols-2 gap-4">
							<UFormField label="Motståndare" name="opponent">
								<UInput v-model="matchState.opponent" placeholder="Motståndare"/>
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
								<UInputTime v-model="timeValue" :hour-cycle="24"/>
							</UFormField>

							<UFormField label="Säsong" name="season" class="w-30">
								<UInputNumber v-model="matchState.season" :min="0"/>
							</UFormField>
						</div>

					</div>
					<USeparator class="w-full" />
					<div>
						<h1 class="text-lg uppercase tracking-[0.2em] mb-2">Match Resultat</h1>
						<div class="grid grid-cols-2 gap-4">
							<UFormField label="Motståndarens poäng" name="opponentScore">
								<UInputNumber v-model="matchState.result.opponentScore" :min="1" class="w-30"/>
							</UFormField>

							<UFormField label="Map" name="map" class="w-full">
								<USelectMenu
									v-model="matchState.result.map"
									value-key="id"
									:items="mapOptions"
									class="w-full"/>
							</UFormField>

							<UFormField label="CGI score" name="cgiScore" >
								<UInputNumber v-model="matchState.result.cgiScore" :min="1" class="w-30"/>
							</UFormField>

							<UFormField label="Replay länk" name="replayLink" class="w-full">
								<UInput v-model="matchState.result.replayLink" placeholder="Replay länk" class="w-full"/>
							</UFormField>
						</div>
					</div>
				</div>
				<USeparator class="w-full" />
				<div class="flex flex-row gap-4">
					<UButton
						label="Avbryt"
						color="neutral"
						variant="outline"
						@click="open = false" />
					<UButton
						label="Spara"
						variant="subtle"
						color="primary"
						type="submit" />
				</div>
			</UForm>
		</template>		
	</UModal>
</template>