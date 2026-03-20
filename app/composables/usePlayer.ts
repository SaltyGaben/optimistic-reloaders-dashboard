import type { PlayerSchema } from "~/components/EditPlayerModal.vue"
import { api } from "~~/convex/_generated/api"
import type { Id } from "~~/convex/_generated/dataModel"


export const usePlayer = () => {
	const client = useConvexClient()

	const updatePlayer = async (schema: PlayerSchema, userId: Id<'users'>) => {
		return await client.mutation(api.users.updatePlayer, { data: schema, userId: userId })
	}

	return { updatePlayer }
}