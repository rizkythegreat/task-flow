# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TaskFlow — a real-time collaborative kanban/project management app. React 19 + TypeScript + Vite frontend; Supabase (Postgres + Auth + Realtime) as the entire backend. There is no server code in this repo — all data access goes through the Supabase JS client with Row Level Security enforcing permissions.

## Commands

```bash
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # tsc -b && vite build — this is also the type check (no separate typecheck script)
npm run lint      # eslint .
npm run preview   # preview production build
```

Both `package-lock.json` and `bun.lock` exist; `bun` commands work equally.

There is no test framework configured — no test files, no test script.

**Environment**: `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` is required; `src/shared/lib/supabase.ts` throws at startup if missing. Copy from `.env.example`.

**Database schema**: applied manually via Supabase SQL Editor (no migrations). `supabase-schema.sql` is the full schema (tables, RLS policies, triggers incl. `on_auth_user_created` which creates a profile row); `fix-rls-policy.sql` is a later patch to the `project_members` INSERT policy.

## Architecture

### Structure

- `src/app/` — `App.tsx` (router + provider tree) and providers (`AuthProviders.tsx`, `ThemeProviders.tsx`)
- `src/pages/` — route components: `LandingPage`, `LoginPage`, `DashboardPage`, `NotFoundPage`
- `src/features/{auth,projects,tasks,kanban,members,presence}/` — feature modules, each with `components/`, optional `hooks/`, and an `index.ts` barrel export
- `src/shared/` — `components/ui/` (shadcn/ui), `components/layout/`, `hooks/`, `lib/`, `types/`

Path alias: `@/` → `src/` (both tsconfig and vite.config.ts).

Note: the README's "Project Structure" section is partly outdated (e.g. `stores/`, `config/`, and several listed files don't exist) — trust the actual `src/` tree over the README.

### Routing & navigation

Only 4 routes exist. The whole app lives in `/dashboard`: selecting a project is local `useState` in `DashboardPage` (ProjectList ↔ ProjectBoard toggle), **not** a route param. There is no URL per project/task.

### Data layer pattern

No client state library — server state is entirely TanStack Query, keyed like `['tasks', projectId]`. Each feature exposes hooks in `features/*/hooks/`:

1. A query hook (e.g. `useTasks`) that fetches via Supabase with relation joins (`profiles!tasks_assigned_to_fkey`) **and**, in the same hook, subscribes to a Supabase Realtime `postgres_changes` channel filtered by `project_id`. On any change event it calls `queryClient.invalidateQueries` — that's how real-time sync works; there is no optimistic cache patching.
2. Mutation hooks (`useCreateTask`, `useUpdateTask`, ...) that invalidate the relevant query key on success. Update mutations take `projectId` solely for invalidation.

Follow this pattern when adding new data access: query + realtime invalidation in one hook, mutations invalidating by key.

Presence (`features/presence/hooks/use-presence.ts`) is different: it uses Supabase Presence channels (`channel.track()` with auth metadata, no DB query) — the `user_presence` table in the schema is not what the UI reads.

### Auth & permissions (two layers)

- **Client**: `AuthProvider` (`src/app/providers/AuthProviders.tsx`) exposes `useAuth()` with `user`, `profile` (from the `profiles` table), and sign-in/up/out. Route protection is imperative — `DashboardPage` redirects to `/login` in a `useEffect`; there is no `ProtectedRoute` wrapper.
- **UI gating**: `usePermissions(projectId)` in `src/shared/hooks/use-permission.tsx` maps the user's `project_members.role` (admin/editor/viewer) to a `Permissions` object used to show/hide controls.
- **Enforcement**: real security is the RLS policies in `supabase-schema.sql` (e.g. only editors/admins can insert tasks, only admins delete). Client permission checks are cosmetic; if adding a capability, the RLS policy must allow it too.

### Types

`src/shared/lib/database.types.ts` is the Supabase `Database` type but **hand-maintained** — it contains custom union types (`UserRole`, `TaskStatus`, `TaskPriority`) that a `supabase gen types` regeneration would clobber. `src/shared/types/index.ts` derives domain types from it (`Tables<'tasks'>` etc.), defines relation-extended types (`TaskWithAssignee`), and holds status/priority/role constants and color maps used by the kanban board.

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin — configuration lives in `src/styles/index.css` (CSS-based config, no `tailwind.config.js`). shadcn/ui components in `src/shared/components/ui/` (see `components.json`). Theme switching handled by `ThemeProviders.tsx`. Prettier is configured (`.prettierrc`: single quotes, no trailing commas, 100 print width).
