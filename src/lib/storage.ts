import type { Task, ViewMode } from '../types'

const TASKS_KEY = 'em_tasks'
const VIEW_KEY = 'em_view'

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Task[]) : []
  } catch {
    // Corrupt or unavailable storage — start fresh rather than crash.
    return []
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export function loadView(): ViewMode {
  const raw = localStorage.getItem(VIEW_KEY)
  return raw === 'lanes' ? 'lanes' : 'matrix'
}

export function saveView(view: ViewMode): void {
  localStorage.setItem(VIEW_KEY, view)
}
