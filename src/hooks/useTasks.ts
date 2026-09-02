import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { Quadrant, Task, TaskDraft } from '../types'
import { loadTasks, saveTasks } from '../lib/storage'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)

  const sync = (next: Task[]) => {
    setTasks(next)
    saveTasks(next)
  }

  const addTask = (draft: TaskDraft) =>
    sync([
      ...tasks,
      {
        ...draft,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        order: tasks.filter((t) => t.quadrant === draft.quadrant).length,
      },
    ])

  const updateTask = (id: string, patch: Partial<Task>) =>
    sync(tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const deleteTask = (id: string) =>
    sync(tasks.filter((t) => t.id !== id))

  const toggleDone = (id: string) =>
    updateTask(id, { done: !tasks.find((t) => t.id === id)?.done })

  // Move a task within its quadrant and reassign sequential order values.
  const reorderTasks = (quadrant: Quadrant, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const quadrantTasks = tasks.filter((t) => t.quadrant === quadrant).sort((a, b) => a.order - b.order)
    if (
      fromIndex < 0 ||
      fromIndex >= quadrantTasks.length ||
      toIndex < 0 ||
      toIndex >= quadrantTasks.length
    ) {
      return
    }
    sync([
      ...tasks.filter((t) => t.quadrant !== quadrant),
      ...arrayMove(quadrantTasks, fromIndex, toIndex).map((task, index) => ({ ...task, order: index })),
    ])
  }

  // Move a task into another quadrant, appending it at the end of that list.
  const moveToQuadrant = (id: string, newQuadrant: Quadrant) => {
    const task = tasks.find((t) => t.id === id)
    if (!task || task.quadrant === newQuadrant) return
    sync([
      ...tasks.filter((t) => t.id !== id),
      { ...task, quadrant: newQuadrant, order: tasks.filter((t) => t.quadrant === newQuadrant).length },
    ])
  }

  const importTasks = (imported: Task[]) => {
    sync(imported)
  }

  return { tasks, addTask, updateTask, deleteTask, toggleDone, reorderTasks, moveToQuadrant, importTasks }
}
