# Optimistic Reloaders Dashboard

Internal dashboard for **CGI Optimistic Reloaders**.

Built with Nuxt 4, Convex, Clerk, and Nuxt UI, the app gives the team one place to manage upcoming matches, track player availability, browse match history, and keep player details up to date.

## What it does

- **Sign-in and access control** with Clerk.
- **Discord guild gating** so only approved members can access the dashboard.
- **Upcoming match overview** with ready / not ready responses from players.
- **Monthly match calendar** that highlights scheduled match days.
- **Match history** with results, maps, scores, and replay links.
- **Player directory** with editable player details such as Steam ID and shirt size.
- **Admin flow** for creating matches and updating match results.

## Stack

- **Frontend:** Nuxt 4, Vue 3, Nuxt UI, Pinia
- **Backend / data:** Convex
- **Auth:** Clerk
- **Validation:** Zod
- **Styling:** Tailwind CSS 4

## Local development

### 1. Install dependencies

```bash
bun install
```

### 2. Create your environment file

Copy the example file and fill in the required values:

```bash
cp .env.local.example .env.local
```

Main variables used by the app:

- `CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `NUXT_PUBLIC_CONVEX_URL`
- `CONVEX_SITE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `CLERK_WEBHOOK_SECRET`
- `REQUIRED_GUILD_ID`

### 3. Run the app

```bash
bun run dev
```

The Nuxt dev server starts on `http://localhost:3000`.

## Scripts

```bash
bun run dev
bun run build
bun run preview
bun run lint
bun run lint:fix
```

## Project structure

```text
app/        Nuxt app pages, layouts, components, composables, and stores
convex/     Convex schema, queries, mutations, actions, and HTTP handlers
```

## Notes

- Clerk user events are synced into Convex through the `/clerk-users-webhook` HTTP route.
- Access is checked against a required Discord guild before a signed-in user can use protected pages.
- The current UI copy is mainly written in Swedish.
