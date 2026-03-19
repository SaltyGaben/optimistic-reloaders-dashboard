import type { Doc } from "~~/convex/_generated/dataModel"

type User = Doc<'users'>

export const useUserStore = defineStore('user', () => {
	const currentUser = ref<User>()

	const isAdmin = computed(() => currentUser.value?.role === 'admin')
	const isMember = computed(() => currentUser.value?.isServerMember ?? false)

	const setUser = async (user: User) => {
		currentUser.value = user
		if (import.meta.client) {
			localStorage.setItem('currentUser', JSON.stringify(user))
		}
	}

	const loadFromStorage = () => {
		if (import.meta.client) {
			const data = localStorage.getItem('currentUser')
			if (data) currentUser.value = JSON.parse(data)
		}
	}

	return { currentUser, isAdmin, isMember, setUser, loadFromStorage }

})