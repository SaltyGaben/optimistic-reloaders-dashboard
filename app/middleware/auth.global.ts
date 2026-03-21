import { ConvexHttpClient } from 'convex/browser'
import { api } from '~~/convex/_generated/api'

const protectedRoute = createRouteMatcher(['/', '/matches', '/players', '/links'])
const nonProtectedRoute = createRouteMatcher(['/login'])
const adminRoute = createRouteMatcher(['/admin'])

export default defineNuxtRouteMiddleware(async (to) => {
	if (!import.meta.client) return

	console.log("Loading middleware")
	

	const { isLoaded, isSignedIn, getToken } = useAuth()
	const userStore = useUserStore()

	console.log("useAuth Loaded: ", isLoaded, ", and Signed In: ", isSignedIn)

	if (!isLoaded.value) return

	if (!isSignedIn.value) {
		if (!nonProtectedRoute(to)) return navigateTo('/sign-in')
		return
	}

	if (to.path === '/sign-in') return navigateTo('/')

	if (!userStore.currentUser) userStore.loadFromStorage()

	if (!userStore.currentUser) {
		let token: string | null = null
		try {
			token = await Promise.race([
				getToken.value({ template: 'convex' }),
				new Promise<string>((_, reject) =>
					setTimeout(() => reject(new Error('getToken timed out')), 5000)
				),
			])
		} catch (err) {
			console.error('Failed to get Convex token:', err)
			return navigateTo('/sign-in')
		}

		if (!token) return navigateTo('/sign-in')

		const config = useRuntimeConfig()
		const client = new ConvexHttpClient(config.public.convexUrl)
		client.setAuth(token)

		const user = await client.query(api.users.getAccessState)
		if (!user) return navigateTo('/not-allowed')

		userStore.setUser(user)
	}

	if (protectedRoute(to) && !userStore.isMember) {
		return navigateTo('/not-allowed')
	}

	if (adminRoute(to) && !userStore.isAdmin) {
		return navigateTo('/')
	}
})