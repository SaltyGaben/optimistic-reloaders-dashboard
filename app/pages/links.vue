<script setup lang="ts">
type ExternalLink = {
	label: string
	href: string
}

type LinkSection = {
	title: string
	description: string
	icon: string
	links: ExternalLink[]
	compactGrid?: boolean
}

const sections: LinkSection[] = [
	{
		title: 'Svenska företags ligan',
		description: 'Officiell information och turneringsöversikt.',
		icon: 'i-lucide-trophy',
		compactGrid: false,
		links: [
			{ label: 'Hemsida', href: 'https://publiclir.se/svenska-foeretagsligan' },
			{ label: 'Toornament', href: 'https://play.toornament.com/en_US/tournaments/2435506856337696767/stages/' },
		],
	},
	{
		title: 'Counter-Strike',
		description: 'Kartor, kastlinjer och taktik.',
		icon: 'i-lucide-crosshair',
		compactGrid: false,
		links: [{ label: 'CS Nades', href: 'https://csnades.gg/' }],
	},
	{
		title: 'Publiclir på Twitch',
		description: 'Livestreams från ligan.',
		icon: 'i-lucide-radio',
		compactGrid: true,
		links: [
			{ label: 'Publiclir 1', href: 'https://www.twitch.tv/publiclirtv' },
			{ label: 'Publiclir 2', href: 'https://www.twitch.tv/publiclirtv2' },
			{ label: 'Publiclir 3', href: 'https://www.twitch.tv/publiclirtv3' },
			{ label: 'Publiclir 4', href: 'https://www.twitch.tv/publiclirtv4' },
			{ label: 'Publiclir 5', href: 'https://www.twitch.tv/publiclirtv5' },
		],
	},
]
</script>

<template>
	<UPage>
		<UPageHeader
			title="Länkar"
			description="Snabbgenvägar till ligor, verktyg och sändningar — öppnas i ny flik."
		/>
		<UPageBody>
			<div class="grid gap-6 lg:grid-cols-2">
				<UCard
					v-for="section in sections"
					:key="section.title"
					variant="subtle"
					class="flex flex-col"
					:class="{ 'lg:col-span-2': section.compactGrid }"
				>
					<template #header>
						<div class="flex items-start gap-3">
							<div
								class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20"
							>
								<UIcon :name="section.icon" class="size-5" />
							</div>
							<div class="min-w-0 flex-1 space-y-1">
								<h2 class="text-lg font-semibold tracking-tight text-highlighted">
									{{ section.title }}
								</h2>
								<p class="text-sm text-muted">
									{{ section.description }}
								</p>
							</div>
						</div>
					</template>

					<div
						class="flex flex-col gap-2"
						:class="section.compactGrid ? 'sm:grid sm:grid-cols-2 sm:gap-2' : ''"
					>
						<UButton
							v-for="link in section.links"
							:key="link.href"
							:href="link.href"
							target="_blank"
							external
							variant="soft"
							color="neutral"
							:label="link.label"
							trailing-icon="i-lucide-external-link"
							class="justify-between"
						/>
					</div>
				</UCard>
			</div>
		</UPageBody>
	</UPage>
</template>
