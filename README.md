# Real-Time Collaborative Project Management

A modern, real-time collaborative project management application built with React, TypeScript, Supabase, and TanStack Query. Features include drag-and-drop task management, role-based access control, and live collaboration.

## 🚀 Features

### Core Features

- **Real-time Collaboration**: Live updates across all connected users using Supabase Realtime
- **Drag & Drop Kanban Board**: Intuitive task management with @dnd-kit
- **Role-Based Access Control (RBAC)**: Three user roles with different permissions
  - **Admin**: Full control over projects, tasks, and team members
  - **Editor**: Can create and edit tasks, assign team members
  - **Viewer**: Read-only access to project and tasks
- **User Presence**: See who's online and actively working on the project
- **Project Management**: Create and manage multiple projects
- **Task Management**: Create, edit, delete, and assign tasks with priorities

### Technical Features

- **TypeScript**: Full type safety throughout the application
- **TanStack Query**: Efficient server state management with automatic caching
- **Supabase**: Backend-as-a-Service for database, authentication, and realtime
- **Tailwind CSS**: Modern, responsive UI design
- **shadcn/ui**: High-quality, accessible UI components
- **Row Level Security**: Database-level security policies

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **State Management**: TanStack Query (React Query)
- **Database & Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives with shadcn/ui
- **Drag & Drop**: @dnd-kit
- **Date Handling**: date-fns
- **Notifications**: Sonner

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd task-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   a. Create a new project at [supabase.com](https://supabase.com)

   b. Copy the `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   c. Update `.env` with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   d. Run the SQL schema in Supabase SQL Editor:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄️ Database Schema

### Tables

- **profiles**: User profiles linked to Supabase Auth
- **projects**: Project information and metadata
- **project_members**: Project membership with roles (admin/editor/viewer)
- **tasks**: Task information with status, priority, and assignments
- **user_presence**: Track online users in real-time

### Relationships

```
profiles
  ├── projects (owner)
  ├── project_members
  ├── tasks (assigned_to, created_by)
  └── user_presence

projects
  ├── project_members
  ├── tasks
  └── user_presence

project_members
  ├── profiles
  └── projects

tasks
  ├── projects
  ├── profiles (assignee)
  └── profiles (creator)
```

## 🔐 Role-Based Access Control

### Admin

- Create, edit, and delete projects
- Manage team members (add/remove/change roles)
- Full CRUD operations on tasks
- Assign tasks to team members
- Delete any tasks

### Editor

- Edit project tasks
- Create new tasks
- Assign tasks to team members
- Update task status and priority
- Cannot delete tasks or manage team members

### Viewer

- Read-only access to all project data
- View tasks and their details
- See team members
- Cannot make any modifications

## 🎯 Usage

### Creating a Project

1. Click "New Project" button
2. Enter project name and description
3. You'll automatically be added as an admin

### Managing Tasks

1. Select a project from the list
2. Click "New Task" to create a task
3. Fill in task details:
   - Title (required)
   - Description (optional)
   - Status (todo, in_progress, review, done)
   - Priority (low, medium, high, urgent)
   - Tags (optional)
   - Assignee (optional)
4. Drag and drop tasks between columns to change status

### Real-time Collaboration

- All changes are synchronized in real-time
- See online team members with presence indicators
- Updates appear instantly without refreshing

## 📁 Project Structure

```
task-management/
├── public/                          # Static assets
│   └── vite.svg
│
├── src/
│   ├── app/                        # App-level configuration
│   │   ├── App.tsx                 # Main App component
│   │   └── providers/              # App providers
│   │       ├── AuthProvider.tsx
│   │       ├── ThemeProvider.tsx
│   │       └── QueryProvider.tsx
│   │
│   ├── features/                   # Feature-based modules
│   │   ├── auth/                   # Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── AuthForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-auth.ts
│   │   │   ├── stores/
│   │   │   │   └── use-auth-store.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── projects/               # Projects feature
│   │   │   ├── components/
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── ProjectBoard.tsx
│   │   │   │   └── ProjectCard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-projects.ts
│   │   │   ├── stores/
│   │   │   │   └── use-project-store.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── tasks/                  # Tasks feature
│   │   │   ├── components/
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   ├── TaskModal.tsx
│   │   │   │   ├── TaskDetail.tsx
│   │   │   │   └── TaskFilters.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-tasks.ts
│   │   │   ├── stores/
│   │   │   │   └── use-task-store.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── kanban/                 # Kanban board feature
│   │   │   ├── components/
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── KanbanColumn.tsx
│   │   │   │   └── DragOverlay.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── members/                # Members management
│   │   │   ├── components/
│   │   │   │   ├── MembersModal.tsx
│   │   │   │   ├── MemberList.tsx
│   │   │   │   └── InviteMember.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-members.ts
│   │   │   └── index.ts
│   │   │
│   │   └── presence/               # Real-time presence
│   │       ├── components/
│   │       │   └── UserPresence.tsx
│   │       ├── hooks/
│   │       │   └── use-presence.ts
│   │       └── index.ts
│   │
│   ├── shared/                     # Shared resources
│   │   ├── components/             # Shared components
│   │   │   ├── ui/                 # UI components (shadcn)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   └── dropdown-menu.tsx
│   │   │   ├── layout/             # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Container.tsx
│   │   │   └── common/             # Common components
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── EmptyState.tsx
│   │   │
│   │   ├── hooks/                  # Shared hooks
│   │   │   ├── use-permissions.ts
│   │   │   ├── use-toast.ts
│   │   │   └── use-media-query.ts
│   │   │
│   │   ├── lib/                    # Core utilities
│   │   │   ├── supabase.ts
│   │   │   ├── utils.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── types/                  # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── database.types.ts
│   │   │   ├── supabase.ts
│   │   │   └── models/
│   │   │       ├── task.types.ts
│   │   │       ├── project.types.ts
│   │   │       └── user.types.ts
│   │   │
│   │   └── stores/                 # Global stores
│   │       └── use-ui-store.ts
│   │
│   ├── config/                     # Configuration files
│   │   ├── env.ts
│   │   └── query-client.ts
│   │
│   ├── assets/                     # Assets (images, fonts, etc)
│   │   └── react.svg
│   │
│   ├── styles/                     # Global styles
│   │   └── index.css
│   │
│   ├── main.tsx                    # Entry point
│   └── vite-env.d.ts
│
├── .env                            # Environment variables
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── components.json
│
├── supabase-schema.sql            # Database schema
├── fix-rls-policy.sql
│
└── docs/                          # Documentation
    ├── README.md
    ├── SETUP.md
    ├── QUICKSTART.md
    ├── PROJECT_OVERVIEW.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── TYPESCRIPT_NOTES.md
    ├── DARK_MODE.md
    ├── TOOLTIP_USAGE.md
    ├── ZUSTAND_GUIDE.md
    └── FOLDER_STRUCTURE.md
```

## 🔄 Real-time Features

### Task Updates

- Instant synchronization when tasks are created, updated, or deleted
- Real-time status changes when dragging tasks
- Live updates of task assignments

### User Presence

- See who's currently viewing the project
- Online/offline status indicators
- Automatic presence cleanup on disconnect

### Project Changes

- Live updates when team members are added/removed
- Real-time project metadata changes
- Instant notification of new projects

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel deploy
```

### Deploy to Netlify

```bash
netlify deploy --prod
```

### Environment Variables

Make sure to set these in your deployment platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🧪 Development

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Lint Code

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the repository.

---

Built with ❤️ using React, TypeScript, Supabase, and TanStack Query
