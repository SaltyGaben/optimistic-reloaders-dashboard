import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
	users: defineTable({
		externalId: v.string(),
		discordId: v.optional(v.string()),
		username: v.string(),
		avatarUrl: v.string(),
		email: v.optional(v.string()),
		lastLoginAt: v.optional(v.string()),
		role: v.optional(v.union(v.literal('player'), v.literal('admin'))),
		isActive: v.optional(v.boolean()),
		isServerMember: v.optional(v.boolean()),
		lastServerMemberCheckAt: v.optional(v.number()),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		fullName: v.optional(v.string()),
		steamId: v.optional(v.string()),
		metadata: v.optional(v.any()),
	}).index("by_externalId", ["externalId"]),
	matchDay: defineTable({
		date: v.string(),
		opponent: v.string(),
		time: v.string(),
		readyPlayers: v.array(v.object({
			userId: v.id('users'),
			imageUrl: v.string(),
			username: v.string()
		})),
		season: v.number(),
		result: v.optional(v.object({
			map: v.string(),
			cgiScore: v.string(),
			opponentScore: v.string(),
			replayLink: v.optional(v.string())
		})),
	}).index("by_date", ["date"])
})