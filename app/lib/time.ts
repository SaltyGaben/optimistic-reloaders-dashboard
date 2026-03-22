export type OutputFormat = "date" | "iso" | "local" | "utc";

const normalizeUnix = (unix: number): number => {
	if (Math.abs(unix) < 1e11) {
		return unix * 1000
	}
	return unix
}

/**
 * Convert a unix timestamp (seconds or milliseconds) to a Date,
 * ISO string, or formatted string.
 *
 * @param unix - unix timestamp in seconds or milliseconds
 * @param format - "date" | "iso" | "local" | "utc"
 */
export const fromUnix = (
	unix: number,
	format: OutputFormat = "date",
): Date | string => {
	const ms = normalizeUnix(unix)
	const d = new Date(ms)

	if (format === "date") return d
	if (format === "iso") return d.toISOString()
	if (format === "utc") return d.toUTCString()
	return d.toLocaleString()
}

export const unixToDisplay = (
	unix: number | null | undefined,
	fallback = "-",
	format: Exclude<OutputFormat, "date"> = "local",
): string => {
	if (unix == null || Number.isNaN(Number(unix))) return fallback
	try {
		return String(fromUnix(Number(unix), format))
	} catch {
		return fallback
	}
}