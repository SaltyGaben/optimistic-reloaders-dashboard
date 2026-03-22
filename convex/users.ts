import { action, internalMutation, internalQuery, mutation, query, type ActionCtx, type QueryCtx } from './_generated/server'
import type { WithoutSystemFields } from 'convex/server'
import type { Doc } from './_generated/dataModel'
import { createClerkClient, type UserJSON } from '@clerk/backend'
import { v, type Validator } from 'convex/values'
import { fromUnix } from '../app/lib/time'
import { internal } from './_generated/api'

const clerkClient = createClerkClient({ secretKey: process.env.NUXT_CLERK_SECRET_KEY })

export const current = query({
	args: {},
	handler: async (ctx) => {
		return await getCurrentUser(ctx)
	}
})

export const getAllUsers = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('users').collect()
	}
})

export const addRole = mutation({
	args: {
		roletoAdd: v.union(v.literal('player'), v.literal('admin')),
		id: v.id('users')
	},
	handler: async (ctx, { id, roletoAdd }) => {
		const user = await ctx.db.get(id)
		if (!user) throw new Error('User not found')

		await ctx.db.patch(id, { role: roletoAdd })

		return { success: true }
	}
})

export const removeRole = mutation({
	args: {
		id: v.id('users')
	},
	handler: async (ctx, { id }) => {
		const user = await ctx.db.get(id)
		if (!user) throw new Error('User not found')

		await ctx.db.patch(id, { role: undefined })

		return { success: true }
	}
})

export const getUser = query({
	args: {
		id: v.id('users')
	},
	handler: async (ctx, { id }) => {
		return await ctx.db.get(id)
	}
})

export const upsertFromClerk = internalMutation({
	args: { data: v.any() as Validator<UserJSON> },
	async handler(ctx, { data }) {
		const userAttributes: WithoutSystemFields<Doc<'users'>> = {
			username: data.external_accounts[0]?.username ?? '',
			discordId: data.external_accounts[0]?.id,
			externalId: data.id,
			email: data.external_accounts[0]?.email_address,
			avatarUrl: data.external_accounts[0]?.image_url ?? '',
			lastLoginAt: data.last_sign_in_at ? fromUnix(data.last_sign_in_at, 'local').toString() : undefined,
			role: 'player',
			isActive: true
		}

		const user = await userByExternalId(ctx, data.id)
		if (user === null) {
			await ctx.db.insert('users', userAttributes)
		} else {
			await ctx.db.patch(user._id, userAttributes)
		}
	}
})

export const deleteFromClerk = internalMutation({
	args: { clerkUserId: v.string() },
	async handler(ctx, { clerkUserId }) {
		const user = await userByExternalId(ctx, clerkUserId)

		if (user !== null) {
			await ctx.db.delete(user._id)
		} else {
			console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`)
		}
	}
})

export const getCurrentUserOrThrow = async (ctx: QueryCtx) => {
	const userRecord = await getCurrentUser(ctx)
	if (!userRecord) throw new Error("Can't get current user")
	return userRecord
}

export const getCurrentUser = async (ctx: QueryCtx) => {
	const identity = await ctx.auth.getUserIdentity()
	if (identity === null) {
		return null
	}
	return await userByExternalId(ctx, identity.subject)
}

const userByExternalId = async (ctx: QueryCtx, externalId: string) => {
	return await ctx.db
		.query('users')
		.withIndex('by_externalId', (q) => q.eq('externalId', externalId))
		.unique()
}

export const getUserByExternalId = internalQuery({
	args: { externalId: v.string() },
	async handler(ctx, { externalId }) {
		return await userByExternalId(ctx, externalId)
	}
})

export const setMembershipStatus = internalMutation({
	args: { userId: v.id('users'), isMember: v.boolean(), checkedAt: v.number() },
	async handler(ctx, { userId, isMember, checkedAt }) {
		await ctx.db.patch(userId, {
			isServerMember: isMember,
			lastServerMemberCheckAt: checkedAt
		})
	}
})

const checkMembershipHandler = async (ctx: ActionCtx, { userId }: { userId: string }): Promise<boolean> => {
	const user = await ctx.runQuery(internal.users.getUserByExternalId, {
		externalId: userId
	})

	if (!user?.discordId) {
		return false
	}

	const now = Date.now()
	const needsRefresh = !user.lastServerMemberCheckAt || now - user.lastServerMemberCheckAt > 10 * 60 * 1000

	if (!needsRefresh) {
		return user.isServerMember ?? false
	}

	const isMember = await fetchDiscordGuildCheck(userId)

	await ctx.runMutation(internal.users.setMembershipStatus, {
		userId: user._id,
		isMember,
		checkedAt: now
	})

	return isMember
}

export const checkMembership = action({
	args: { userId: v.string() },
	handler: checkMembershipHandler
})

const callDiscordGuildCheckHandler = async (ctx: ActionCtx, { clerkUserId }: { clerkUserId: string }): Promise<boolean> => {
	return await fetchDiscordGuildCheck(clerkUserId)
}

export const callDiscordGuildCheck = action({
	args: { clerkUserId: v.string() },
	handler: callDiscordGuildCheckHandler
})

const fetchDiscordGuildCheck = async (clerkUserId: string) => {
	const accessToken = await clerkClient.users.getUserOauthAccessToken(clerkUserId, 'discord')
	const token = accessToken.data[0]?.token

	const requiredGuildId = process.env.REQUIRED_GUILD_ID
	if (!token || !requiredGuildId) {
		return false
	}

	const res = await fetch('https://discord.com/api/users/@me/guilds', {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	if (!res.ok) {
		const errorText = await res.text()
		return false
	}

	const guilds = await res.json()

	const isMember = Array.isArray(guilds) && guilds.some((g: any) => g.id === requiredGuildId)

	return isMember
}

export const getAccessState = query({
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {			
			return null
		}

		return await userByExternalId(ctx, identity.subject)
	}
})

export const updatePlayer = mutation({
	args: {
		data: v.object({
			firstName: v.string(),
			lastName: v.string(),
			steamId: v.string(),
			shirtSize: v.string(),
		}),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {

		const fullName = args.data.firstName + ' ' + args.data.lastName

		await ctx.db.patch('users', args.userId, {
			...args.data,
			fullName: fullName
		})

		return args.userId
	}
})