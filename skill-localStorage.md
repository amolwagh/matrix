# Skill: localStorage
# Load when: working on useTasks, storage.ts, or any persistence logic

## Purpose
Typed localStorage CRUD for Task objects — single key, array-based store.

## Storage Schema
- Key: `em_tasks` → Task[]
- Key: `em_view`  → ViewMode

## Patterns & Recipes

### storage.ts — base helpers
```ts
const TASKS_KEY = 'em_tasks'

export function loadTasks(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) ?? '[]')
  } catch { return [] }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}
```

### useTasks hook — shape
```ts
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)

  const sync = (next: Task[]) => { setTasks(next); saveTasks(next) }

  const addTask = (draft: TaskDraft) =>
    sync([...tasks, { ...draft, id: crypto.randomUUID(), createdAt: Date.now(), order: tasks.filter(t => t.quadrant === draft.quadrant).length }])

  const updateTask = (id: string, patch: Partial<Task>) =>
    sync(tasks.map(t => t.id === id ? { ...t, ...patch } : t))

  const deleteTask = (id: string) =>
    sync(tasks.filter(t => t.id !== id))

  const toggleDone = (id: string) =>
    updateTask(id, { done: !tasks.find(t => t.id === id)?.done })

  return { tasks, addTask, updateTask, deleteTask, toggleDone }
}
```

## Gotchas
- Always wrap loadTasks in try/catch — JSON.parse can throw on corrupt data
- Use crypto.randomUUID() not a lib — it's available in all modern browsers
- Order field: count existing tasks in same quadrant at add time
2×2 CSS grid — grid-cols-2 grid-rows-2, each cell = QuadrantPanel
Divider: 2px center lines (border-r border-b on top-left, etc.)


### Lane view

Single column stack — each QuadrantPanel full width
Good for mobile / narrow screens


### AddTaskModal / EditTaskModal
```ts
// Shared modal — mode prop switches add vs edit
{ mode: 'add' | 'edit'; task?: Task; defaultQuadrant?: Quadrant;
  onSave: (draft: TaskDraft) => void; onClose: () => void }
// Fields: title*, quadrant selector, note, dueDate, tags (comma input → string[])
```

### ViewToggle
```ts
// Top-right — switches ViewMode, persists to localStorage
{ view: ViewMode; onChange: (v: ViewMode) => void }
// Icons: LayoutGrid (matrix) | AlignJustify (lanes)
```

## Gotchas
- Keep TaskCard height auto — don't fix height, content varies
- Tags: store as string[], render as small colored pills
- Due date: show with Calendar icon, red if overdue (dueDate < Date.now())
- Done tasks: strike-through title, reduced opacity — don't hide them