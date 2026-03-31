import { Maps } from "../app/types/maps"
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const getMatchesForMonth = query({
	args: {
		year: v.number(),
		month: v.number(),
	},
	handler: async (ctx, { year, month }) => {
		const start = `${year}-${String(month).padStart(2, '0')}-01`

		const nextMonth = month === 12 ? 1 : month + 1
		const nextYear = month === 12 ? year + 1 : year

		const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

		return await ctx.db
			.query("matchDay")
			.withIndex("by_date", (q) =>
				q.gte("date", start).lt("date", end)
			)
			.collect()
	},
})

export const getNextMatch = query({
	args: { date: v.string() },
	handler: async (ctx, { date }) => {
		const upcomingMatches = await ctx.db.query('matchDay').withIndex('by_date', (q) => q.gte('date', date)).order('asc').collect()

		const firstDate = upcomingMatches[0]?.date

		return upcomingMatches.filter((m) => m.date === firstDate)
	}
})

export const getUpcomingMatches = query({
	args: { date: v.string() },
	handler: async (ctx, { date }) => {
		return await ctx.db.query('matchDay').withIndex('by_date', (q) => q.gte('date', date)).order('asc').collect()
	}
})

export const handleReady = mutation({
	args: {
		ready: v.boolean(),
		userId: v.string(),
		matchId: v.id("matchDay"),
	},
	handler: async (ctx, { ready, userId, matchId }) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_externalId", (q) =>
				q.eq("externalId", userId)
			)
			.first()

		if (!user) throw new Error("User not found")

		const match = await ctx.db.get(matchId)
		if (!match) throw new Error("Match not found")

		const userObj = {
			userId: user._id,
			imageUrl: user.avatarUrl,
			username: user.username
		}

		// Compare by userId (not object reference) so toggling works reliably.
		const alreadyReady = match.readyPlayers.some((p) => p.userId === userObj.userId)

		let updatedReadyPlayers = match.readyPlayers

		if (ready) {
			if (!alreadyReady) updatedReadyPlayers = [...match.readyPlayers, userObj]
		} else {
			if (alreadyReady) {
				updatedReadyPlayers = match.readyPlayers.filter((p) => p.userId !== userObj.userId)
			}
		}

		await ctx.db.patch(matchId, {
			readyPlayers: updatedReadyPlayers,
		})
	},
})

export const saveNewMatch = mutation({
	args: {
		date: v.string(),
		opponent: v.string(),
		time: v.string(),
		season: v.number()
	},
	handler: async (ctx, args) => {
		const insertedId = await ctx.db.insert('matchDay', {
			...args,
			readyPlayers: []
		})

		return { insertedId }
	}
})

export const getMatchHistory = query({
	args: {
		date: v.string()
	},
	handler: async (ctx, { date }) => {
		return await ctx.db.query('matchDay').withIndex('by_date', (q) => q.lte('date', date)).collect()
	}
})

export const updateMatch = mutation({
	args: {
		data: v.object({
			date: v.string(),
			opponent: v.string(),
			time: v.string(),
			season: v.number(),
			result: v.optional(v.object({
				map: v.union(...Object.values(Maps).map(m => v.literal(m))),
				cgiScore: v.number(),
				opponentScore: v.number(),
				replayLink: v.optional(v.string())
			})),
		}),
		matchId: v.id('matchDay')
	},
	handler: async (ctx, args) => {
		await ctx.db.patch('matchDay', args.matchId, {
			...args.data
		})

		return args.matchId
	}
})