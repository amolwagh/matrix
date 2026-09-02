# Eisenhower Matrix App — Agent Instructions

## What This Project Is
Minimal responsive web app to capture and prioritize tasks across the 4 Eisenhower quadrants. No backend — localStorage only.

## Stack
- Runtime: Browser
- Framework: React 18 + Vite
- State: useState + custom useTasks hook
- Persistence: localStorage via lib/storage.ts
- Styling: Tailwind CSS
- Icons: lucide-react
- Key libs: uuid (id gen), date-fns (due date formatting)

## Project Map
src/
├── components/ # Matrix, LaneView, TaskCard, AddTaskModal, QuadrantPanel
├── hooks/ # useTasks.ts — all task CRUD + localStorage sync
├── types/ # index.ts — Task, Quadrant, ViewMode
└── lib/ # storage.ts — typed get/set/remove wrappers


## Types & Contracts
```ts
type Quadrant = 'do-first' | 'strategic' | 'quick-wins' | 'review'
type ViewMode = 'matrix' | 'lanes'

type Task = {
  id: string
  title: string
  quadrant: Quadrant
  createdAt: number       // Date.now()
  done: boolean
  note?: string
  dueDate?: number        // timestamp
  tags?: string[]
  order: number           // sort order within quadrant
}

type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'order'>
```

## Key Conventions
- All localStorage access goes through lib/storage.ts — never call localStorage directly in components
- useTasks is the single source of truth — components never mutate tasks directly
- Icons from lucide-react only — keep bundle lean
- No inline styles — Tailwind classes only
- View toggle (matrix/lanes) stored in localStorage too

## Skills Available
Load with `/skill <name>` — do NOT load unless task needs it:
- `localStorage`  → CRUD helpers, storage key schema, sync pattern
- `ui-components` → component shapes, props contracts, view toggle pattern

## Session Log
<!-- Append /wrap logs here — newest at top -->

### 2026-08-31 — Eisenhower Matrix Full App Build

#### ✅ Done
- Vite + React 18 + TypeScript scaffold from scratch (vite 8, TS 7)
- Tailwind v4 via @tailwindcss/vite plugin
- src/types/index.ts — Task, Quadrant, ViewMode, TaskDraft types
- src/lib/storage.ts — typed localStorage get/set with try/catch (keys: em_tasks, em_view)
- src/hooks/useTasks.ts — addTask, updateTask, deleteTask, toggleDone, all synced to storage
- src/lib/quadrants.ts — quadrant config (label, icon, bg/border/accent classes), single source of truth
- src/components/QuadrantPanel.tsx — header with icon + count, task list, add button, empty state; TaskCard inlined (checkbox, title, due date red if overdue, note icon, tag pills)
- src/components/LaneView.tsx — full-width stacked quadrant panels for mobile/narrow screens
- src/components/ViewToggle.tsx — matrix/lanes toggle (LayoutGrid / AlignJustify), persisted via storage.ts
- src/components/AddTaskModal.tsx — shared add/edit modal: title*, quadrant, due date, note, tags; delete in edit mode; Escape/overlay close
- src/App.tsx — Matrix (2x2 grid with 2px dividers) + Lane view, modal wiring

#### 📐 Contracts
- Task = { id, title, quadrant, createdAt, done, note?, dueDate?, tags?, order }
- Quadrant = 'do-first' | 'strategic' | 'quick-wins' | 'review'
- ViewMode = 'matrix' | 'lanes'
- All localStorage via lib/storage.ts only
- useTasks is single source of truth

#### 🔧 Commands
- npm run dev → local dev server
- npm run build → production build (tsc -b && vite build)
- npm run preview → serve production build locally

#### ⚠️ Gotchas
- crypto.randomUUID() for ids — needs localhost/HTTPS; no uuid package installed
- Due dates anchored at local noon (T12:00:00) so "due today" is not overdue from midnight
- Project sits under OneDrive — exclude node_modules from sync if dev feels slow

#### 🔜 Next Session
- Drag to reorder tasks within quadrant
- Filter by tag
- Hide/show completed tasks toggle
- Keyboard shortcut: N or / to open add modal
- PWA manifest + service worker for mobile install