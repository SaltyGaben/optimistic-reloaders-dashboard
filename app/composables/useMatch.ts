import { api } from "~~/convex/_generated/api"
import type { Doc, Id } from "~~/convex/_generated/dataModel"

type MatchDay = Doc<'matchDay'>

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

	return {
		getMatchesForMonth,
		getNextMatch,
		handleReadyCheck,
		useNextMatchQuery,
		useMatchesForMonthQuery,
	}
}