import { query } from "./_generated/server"

type AggregateBucket = {
	matches: number
	wins: number
	losses: number
	roundsFor: number
	roundsAgainst: number
}

const createBucket = (): AggregateBucket => ({
	matches: 0,
	wins: 0,
	losses: 0,
	roundsFor: 0,
	roundsAgainst: 0,
})

const percentage = (value: number, total: number) => (total === 0 ? 0 : Number(((value / total) * 100).toFixed(1)))
const average = (value: number, total: number) => (total === 0 ? 0 : Number((value / total).toFixed(2)))

export const getStatistics = query({
	args: {},
	handler: async (ctx) => {
		const matchDays = await ctx.db.query("matchDay").collect()
		const completedMatches = matchDays.filter((match) => match.result)
		const totalMatches = completedMatches.length

		let totalWins = 0
		let totalLosses = 0
		let totalRoundsFor = 0
		let totalRoundsAgainst = 0
		let closeMatches = 0
		let blowouts = 0
		let replays = 0

		const mapBuckets = new Map<string, AggregateBucket>()
		const seasonBuckets = new Map<number, AggregateBucket>()
		const teamBuckets = new Map<string, AggregateBucket>()

		for (const match of completedMatches) {
			const result = match.result!
			const map = result.map
			const season = match.season
			const opponent = match.opponent.trim()
			const isWin = result.cgiScore > result.opponentScore
			const margin = Math.abs(result.cgiScore - result.opponentScore)

			totalRoundsFor += result.cgiScore
			totalRoundsAgainst += result.opponentScore
			if (isWin) totalWins += 1
			else totalLosses += 1

			if (margin <= 2) closeMatches += 1
			if (margin >= 6) blowouts += 1
			if (result.replayLink) replays += 1

			if (!mapBuckets.has(map)) mapBuckets.set(map, createBucket())
			if (!seasonBuckets.has(season)) seasonBuckets.set(season, createBucket())
			if (!teamBuckets.has(opponent)) teamBuckets.set(opponent, createBucket())

			const mapBucket = mapBuckets.get(map)!
			mapBucket.matches += 1
			mapBucket.roundsFor += result.cgiScore
			mapBucket.roundsAgainst += result.opponentScore
			if (isWin) mapBucket.wins += 1
			else mapBucket.losses += 1

			const seasonBucket = seasonBuckets.get(season)!
			seasonBucket.matches += 1
			seasonBucket.roundsFor += result.cgiScore
			seasonBucket.roundsAgainst += result.opponentScore
			if (isWin) seasonBucket.wins += 1
			else seasonBucket.losses += 1

			const teamBucket = teamBuckets.get(opponent)!
			teamBucket.matches += 1
			teamBucket.roundsFor += result.cgiScore
			teamBucket.roundsAgainst += result.opponentScore
			if (isWin) teamBucket.wins += 1
			else teamBucket.losses += 1
		}

		const mapStats = Array.from(mapBuckets.entries())
			.map(([map, bucket]) => ({
				map,
				matches: bucket.matches,
				wins: bucket.wins,
				losses: bucket.losses,
				winRate: percentage(bucket.wins, bucket.matches),
				roundsFor: bucket.roundsFor,
				roundsAgainst: bucket.roundsAgainst,
				roundDiff: bucket.roundsFor - bucket.roundsAgainst,
			}))
			.sort((a, b) => b.matches - a.matches)

		const seasonStats = Array.from(seasonBuckets.entries())
			.map(([season, bucket]) => ({
				season,
				matches: bucket.matches,
				wins: bucket.wins,
				losses: bucket.losses,
				winRate: percentage(bucket.wins, bucket.matches),
				roundsFor: bucket.roundsFor,
				roundsAgainst: bucket.roundsAgainst,
				roundDiff: bucket.roundsFor - bucket.roundsAgainst,
			}))
			.sort((a, b) => a.season - b.season)

		const teamStats = Array.from(teamBuckets.entries())
			.map(([opponent, bucket]) => ({
				opponent,
				matches: bucket.matches,
				wins: bucket.wins,
				losses: bucket.losses,
				winRate: percentage(bucket.wins, bucket.matches),
				roundsFor: bucket.roundsFor,
				roundsAgainst: bucket.roundsAgainst,
				roundDiff: bucket.roundsFor - bucket.roundsAgainst,
			}))
			.sort((a, b) => b.matches - a.matches || b.winRate - a.winRate)

		const reliableMapStats = mapStats.filter((map) => map.matches >= 2)
		const bestMap = reliableMapStats.length
			? [...reliableMapStats].sort((a, b) => b.winRate - a.winRate || b.matches - a.matches)[0]
			: null
		const worstMap = reliableMapStats.length
			? [...reliableMapStats].sort((a, b) => a.winRate - b.winRate || b.matches - a.matches)[0]
			: null

		return {
			overview: {
				completedMatches: totalMatches,
				wins: totalWins,
				losses: totalLosses,
				winRate: percentage(totalWins, totalMatches),
				roundsFor: totalRoundsFor,
				roundsAgainst: totalRoundsAgainst,
				roundDiff: totalRoundsFor - totalRoundsAgainst,
				avgCgiScore: average(totalRoundsFor, totalMatches),
				avgOpponentScore: average(totalRoundsAgainst, totalMatches),
				closeMatchRate: percentage(closeMatches, totalMatches),
				blowoutRate: percentage(blowouts, totalMatches),
				replayCoverage: percentage(replays, totalMatches),
			},
			highlights: {
				bestMap,
				worstMap,
				minimumMatchesForMapHighlights: 2,
			},
			mapStats,
			seasonStats,
			teamStats,
		}
	},
})
