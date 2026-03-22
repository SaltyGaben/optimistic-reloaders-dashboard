<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import type { Doc } from "~~/convex/_generated/dataModel"

type MatchDay = Doc<'matchDay'>
type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

interface DayCell {
  date: Date
  iso: string
  inCurrentMonth: boolean
}

const WEEK_STARTS_ON_MONDAY = true

const props = withDefaults(
	defineProps<{
    matchDays?: MatchDay[]
    modelValue?: string
  }>(),
	{
		matchDays: () => [],
	},
)

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "month-change", value: { year: number; month: number }): void
}>()

const monthNames = [
	"Januari",
	"Februari",
	"Mars",
	"April",
	"Maj",
	"Juni",
	"Juli",
	"Augusti",
	"September",
	"October",
	"November",
	"December",
]

const weekdayLabels = WEEK_STARTS_ON_MONDAY
	? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
	: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const today = new Date()

const toIso = (date: Date): string => {
	const y = date.getFullYear()
	const m = `${date.getMonth() + 1}`.padStart(2, "0")
	const d = `${date.getDate()}`.padStart(2, "0")
	return `${y}-${m}-${d}`
}

const initialDate = today

const currentYear = ref(initialDate.getFullYear())
const currentMonth = ref(initialDate.getMonth()) // 0–11

const emitMonthChange = () => {	
	emit("month-change", {
		year: currentYear.value,
		month: currentMonth.value + 1, // convert 0–11 to 1–12
	})
}

const currentMonthLabel = computed(
	() => `${monthNames[currentMonth.value]} ${currentYear.value}`,
)

const matchDaySet = computed(() => new Set(props.matchDays.map(m => m.date)))

const buildMonthDays = (year: number, monthIndex: number): DayCell[] => {
	const firstOfMonth = new Date(year, monthIndex, 1)
	const firstWeekday = firstOfMonth.getDay() as WeekdayIndex
	const offset = WEEK_STARTS_ON_MONDAY ? (firstWeekday + 6) % 7 : firstWeekday

	const daysInThisMonth = new Date(year, monthIndex + 1, 0).getDate()
	const totalCells = Math.ceil((offset + daysInThisMonth) / 7) * 7

	const startDate = new Date(year, monthIndex, 1 - offset)
	const cells: DayCell[] = []

	for (let i = 0; i < totalCells; i++) {
		const d = new Date(startDate)
		d.setDate(startDate.getDate() + i)
		cells.push({
			date: d,
			iso: toIso(d),
			inCurrentMonth: d.getMonth() === monthIndex,
		})
	}

	return cells
}

const days = computed(() =>
	buildMonthDays(currentYear.value, currentMonth.value),
)

const goToPreviousMonth = () => {
	if (currentMonth.value === 0) {
		currentMonth.value = 11
		currentYear.value -= 1
	} else {
		currentMonth.value -= 1
	}

	emitMonthChange()
}

const goToNextMonth = () => {
	if (currentMonth.value === 11) {
		currentMonth.value = 0
		currentYear.value += 1
	} else {
		currentMonth.value += 1
	}

	emitMonthChange()
}

const goToToday = () => {
	currentYear.value = today.getFullYear()
	currentMonth.value = today.getMonth()

	emitMonthChange()
}

const onDayClick = (cell: DayCell) => {
	emit("update:modelValue", cell.iso)
}

onMounted(() => {
	emitMonthChange()
})

const checkToday = (cell: DayCell) => {
	return cell.iso === toIso(today)
}

const getCellClasses = (cell: DayCell): string[] => {
	const isToday = checkToday(cell)
	const isMatch = matchDaySet.value.has(cell.iso)

	const base = cell.inCurrentMonth
		? 'bg-white dark:bg-gray-900'
		: 'bg-gray-50 text-gray-400 dark:bg-gray-900/60'

	const background = isToday
		? 'bg-emerald-50 dark:bg-blue-500/70'
		: isMatch
			? 'bg-emerald-50 dark:bg-red-500/10'
			: ''

	const border = isToday
		? 'border-blue-500/70'
		: isMatch
			? 'border-red-500/70'
			: 'border-gray-200 dark:border-gray-800'

	return [
		base,
		background,
		border,
	]
}
</script>

<template>
	<UCard class="w-full mx-auto" variant="subtle">
		<template #header>
			<div class="flex items-center justify-between gap-3">
				<div>
					<div class="text-base font-semibold">
						{{ currentMonthLabel }}
					</div>
					<div class="text-xs text-gray-500">
						Match dagar är markerade i <span class="text-red-500">rött</span>, dagens dag är markerad i <span class="text-blue-500">blått</span>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<UButton
						icon="i-lucide-chevron-left"
						variant="ghost"
						@click="goToPreviousMonth"
					/>
					<UButton
						icon="i-lucide-chevron-right"
						variant="ghost"
						@click="goToNextMonth"
					/>
					<UButton size="xs" variant="soft" @click="goToToday">
						Idag
					</UButton>
				</div>
			</div>
		</template>

		<div class="space-y-1">
			<div class="grid grid-cols-7 text-[11px] font-medium text-gray-500">
				<div
					v-for="weekday in weekdayLabels"
					:key="weekday"
					class="py-1 text-center"
				>
					{{ weekday }}
				</div>
			</div>

			<div class="grid grid-cols-7 gap-1">
				<button
					v-for="cell in days"
					:key="cell.iso"
					type="button"
					class="relative flex h-26 flex-col items-start rounded-md border text-left text-xs transition-colors hover:scale-105"
					:class="getCellClasses(cell)"
					@click="onDayClick(cell)"
				>
					<span
						class="m-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium"
					>
						{{ cell.date.getDate() }}
					</span>
					<div v-for="match in matchDays.filter(m => m.date === cell.iso)" :key="match._id" class="ml-1 flex flex-row gap-1 mb-2 flex-wrap">
						<h1>{{ match.opponent }}</h1>
						<h1>- {{ match.time }}</h1>
					</div>
					<span
						v-if="matchDaySet.has(cell.iso)"
						class="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500"
					/>
				</button>
			</div>
		</div>
	</UCard>
</template>