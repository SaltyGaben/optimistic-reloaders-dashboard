import { dark } from '@clerk/themes'
import { defineNuxtConfig } from "nuxt/config"

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
	modules: [
		'@nuxt/eslint',
		'@nuxt/ui',
		'@clerk/nuxt',
		'convex-nuxt',
		'@pinia/nuxt',
		'@vueuse/nuxt',
	],
	convex: {
		url: process.env.CONVEX_URL
	},
	runtimeConfig: {
		public: {
			convexUrl: process.env.CONVEX_URL
		}
	},
	clerk: {
		appearance: {
			baseTheme: dark
		}
	},
})