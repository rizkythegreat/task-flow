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
npm run test      # Vitest in watch mode
npm run test:run  # Vitest single run (CI mode)
npx vitest run src/shared/hooks/__tests__/use-permission.test.tsx   # run a single test file
```

Both `package-lock.json` and `bun.lock` exist; `bun` commands work equally.

**Testing**: Vitest + React Testing Library (jsdom, globals enabled, setup in `src/test/setup.ts`, config in the `test` block of `vite.config.ts`). Tests are colocated in `__tests__/` folders next to the code. Patterns: mock `@/shared/lib/supabase` and `@/app/providers/AuthProviders` with `vi.mock`, wrap hooks in a fresh `QueryClientProvider` (retry disabled), wrap dnd-kit components in `DndContext`/`SortableContext`.

Note: `npm run lint` currently reports pre-existing errors in older files (`no-explicit-any`, `react-refresh/only-export-components`) — not a regression signal by itself.

**Environment**: `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` is required; `src/shared/lib/supabase.ts` throws at startup if missing. Copy from `.env.example`.

**Database schema**: applied manually via Supabase SQL Editor (no migrations). `supabase-schema.sql` is the full schema (tables, RLS policies, triggers incl. `on_auth_user_created` which creates a profile row); `fix-rls-policy.sql` is a later patch to the `project_members` INSERT policy.

## Architecture

### Structure

- `src/app/` — `App.tsx` (router + provider tree) and providers (`AuthProviders.tsx`, `ThemeProviders.tsx`; hooks live separately in `use-auth.ts` / `use-theme.ts`)
- `src/pages/` — route components: `LandingPage`, `LoginPage`, `DashboardPage`, `ProjectPage`, `NotFoundPage`
- `src/features/{auth,projects,tasks,kanban,members,presence}/` — feature modules, each with `components/`, optional `hooks/`, and an `index.ts` barrel export
- `src/shared/` — `components/ui/` (shadcn/ui), `components/layout/`, `hooks/`, `lib/`, `types/`

Path alias: `@/` → `src/` (both tsconfig and vite.config.ts).

Note: the README's "Project Structure" section is partly outdated (e.g. `stores/`, `config/`, and several listed files don't exist) — trust the actual `src/` tree over the README.

### Routing & navigation

URL is the source of truth for navigation:

```
/dashboard                          → project list
/projects/:projectId                → kanban board (ProjectPage → ProjectBoard)
/projects/:projectId/tasks/:taskId  → same board with TaskDetail modal open (modal route)
```

All pages are lazy-loaded (`React.lazy` + `Suspense` in `App.tsx`) — dnd-kit/kanban only ships on the project route. Authenticated routes are nested under `<ProtectedRoute>` (redirects to `/login`, preserving origin in `location.state.from` — LoginPage navigates back after sign-in) and `<AppLayout>` (shared header + `<Outlet />`). The TaskDetail modal is URL-driven: `ProjectBoard` derives `detailTask` from the `taskId` param by looking it up in the `useTasks` cache (so realtime updates refresh an open detail), and an unknown `taskId` redirects back to the board. The TaskModal (create/edit form) intentionally stays local state — only *viewing* a task has a URL.

### Data layer pattern

No client state library — server state is entirely TanStack Query, keyed like `['tasks', projectId]`. Each feature exposes hooks in `features/*/hooks/`:

1. A query hook (e.g. `useTasks`) that fetches via Supabase with relation joins (`profiles!tasks_assigned_to_fkey`) **and**, in the same hook, subscribes to a Supabase Realtime `postgres_changes` channel filtered by `project_id`.
2. Mutation hooks (`useCreateTask`, `useUpdateTask`, ...). Update mutations take `projectId` to locate the cache entry.

**Tasks use per-event cache patching, not invalidation** (`use-tasks.ts`): realtime UPDATE merges the payload row into the cache via pure helpers (`upsertTask`/`removeTask`/`mergeTaskRow`, unit-tested in `__tests__/task-cache.test.ts`); INSERT and unmergeable UPDATEs (task not in cache, or `assigned_to` changed so the joined assignee is stale) fall back to a **single-row** fetch with relations — never a full-list refetch. The DELETE listener is registered **without** a `project_id` filter on purpose: delete payloads only carry the primary key, so a filter would never match. `useUpdateTask` is optimistic (`onMutate` patch + rollback `onError`) so drag & drop feels instant. Simpler lists (projects, members) still use plain invalidation — acceptable for low-churn data.

**Pagination**: `useProjects` is a `useInfiniteQuery` with `.range()` (page size `PROJECTS_PAGE_SIZE`, "Load More" in ProjectList); consumers flatten `data.pages`. The kanban board deliberately fetches all tasks per project (like Trello) — per-column pagination would break URL-driven task detail and drag ordering.

Presence (`features/presence/hooks/use-presence.ts`) is different: it uses Supabase Presence channels (`channel.track()` with auth metadata, no DB query) — the `user_presence` table in the schema is not what the UI reads.

### Auth & permissions (two layers)

- **Client**: `AuthProvider` (`src/app/providers/AuthProviders.tsx`) provides the context; `useAuth()` lives in `src/app/providers/use-auth.ts`. Route protection is declarative via the `ProtectedRoute` layout route (`src/features/auth/components/ProtectedRoute.tsx`).
- **UI gating**: `usePermissions(projectId)` in `src/shared/hooks/use-permission.tsx` maps the user's `project_members.role` (admin/editor/viewer) to a `Permissions` object used to show/hide controls.
- **Enforcement**: real security is the RLS policies in `supabase-schema.sql` (e.g. only editors/admins can insert tasks, only admins delete). Client permission checks are cosmetic; if adding a capability, the RLS policy must allow it too.

### Types

`src/shared/lib/database.types.ts` is the Supabase `Database` type but **hand-maintained** — it contains custom union types (`UserRole`, `TaskStatus`, `TaskPriority`) that a `supabase gen types` regeneration would clobber. `src/shared/types/index.ts` derives domain types from it (`Tables<'tasks'>` etc.), defines relation-extended types (`TaskWithAssignee`), and holds status/priority/role constants and color maps used by the kanban board.

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin — configuration lives in `src/styles/index.css` (CSS-based config, no `tailwind.config.js`). shadcn/ui components in `src/shared/components/ui/` (see `components.json`). Theme switching handled by `ThemeProviders.tsx`. Prettier is configured (`.prettierrc`: single quotes, no trailing commas, 100 print width).
