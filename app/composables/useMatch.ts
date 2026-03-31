import { api } from "~~/convex/_generated/api"
import type { Doc, Id } from "~~/convex/_generated/dataModel"
import type { MatchSchema } from "~/components/NewMatchCard.vue"
import type { MatchResultSchema } from "~/components/EditMatchModal.vue"
import { Maps } from "~/types/maps"

type MatchDay = Doc<'matchDay'>

const mapValues = Object.values(Maps) as unknown as string[]
const normalizeMap = (map: string): Maps => {
	if (!mapValues.includes(map)) {
		throw new Error(`Invalid map value: ${map}`)
	}

	return map as Maps
}

export const useMatch = () => {
	const client = useConvexClient()

	const getMatchesForMonth = async (year: number, month: number): Promise<MatchDay[]> => {
		return await client.query(api.matchDay.getMatchesForMonth, { year, month })
	}

	const getNextMatch = async (date: string) => {
		return await client.query(api.matchDay.getNextMatch, { date })
	}

	const handleReadyCheck = async (ready: boolean, matchId: Id<'matchDay'>, userId: string) => {
		return await client.mutation(api.matchDay.handleReady, { ready, matchId, userId })
	}

	const useNextMatchQuery = (date: string) => {
		return useConvexQuery(api.matchDay.getNextMatch, { date })
	}

	const useMatchesForMonthQuery = (year: Ref<number>, month: Ref<number>) => {
		return useConvexQuery(
			api.matchDay.getMatchesForMonth,
			computed(() => ({
				year: year.value,
				month: month.value,
			})),
		)
	}

	const saveNewMatch = async (match: MatchSchema) => {
		return await client.mutation(api.matchDay.saveNewMatch, {
			...match
		})
	}

	const useMatchHistory = (date: string) => {
		return useConvexQuery(api.matchDay.getMatchHistory, { date })
	}

	const updateMatch = async (data: MatchResultSchema, matchId: Id<'matchDay'>) => {
		const normalizedData = {
			...data,
			result: data.result
				? {
					...data.result,
					map: normalizeMap(data.result.map),
				}
				: undefined,
		}

		return await client.mutation(api.matchDay.updateMatch, { data: normalizedData, matchId: matchId })
	}

	const useUpcomingMatches = (date: string) => {
		return useConvexQuery(api.matchDay.getUpcomingMatches, { date })
	}

	const sortMatches = (matchList: MatchDay[], timeSort: 'earliest' | 'latest' = 'earliest') => {
		const today = new Date().setHours(0, 0, 0, 0)
		const dateTs = (date: string) => new Date(`${date}T00:00:00`).getTime()
		const dateTimeTs = (date: string, time: string) => new Date(`${date}T${time}:00`).getTime()

		return matchList.sort((a, b) => {
			const diffA = Math.abs(dateTs(a.date) - today)
			const diffB = Math.abs(dateTs(b.date) - today)
	
			// 1. Closest date to today
			if (diffA !== diffB) return diffA - diffB
	
			// 2. Same date → sort by time (earliest or latest)
			const timeDiff = dateTimeTs(a.date, a.time) - dateTimeTs(b.date, b.time)
			return timeSort === 'latest' ? -timeDiff : timeDiff
		})
	}

	return {
		getMatchesForMonth,
		getNextMatch,
		handleReadyCheck,
		useNextMatchQuery,
		useMatchesForMonthQuery,
		saveNewMatch,
		useMatchHistory,
		updateMatch,
		useUpcomingMatches,
		sortMatches
	}
}