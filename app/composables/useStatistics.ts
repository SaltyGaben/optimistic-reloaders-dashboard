import { api } from "~~/convex/_generated/api"

const MAP_LABELS: Record<string, string> = {
	de_ancient: "Ancient",
	de_anubis: "Anubis",
	de_dust2: "Dust II",
	de_inferno: "Inferno",
	de_mirage: "Mirage",
	de_nuke: "Nuke",
	de_overpass: "Overpass",
}

export const useStatistics = () => {
	const useStatisticsQuery = () => {
		return useConvexQuery(api.statistics.getStatistics, {})
	}

	const mapLabel = (map: string) => MAP_LABELS[map] ?? map.replace("de_", "").replace("_", " ")
	const percentageLabel = (value: number) => `${value.toFixed(1)}%`

	return {
		useStatisticsQuery,
		mapLabel,
		percentageLabel,
	}
}
