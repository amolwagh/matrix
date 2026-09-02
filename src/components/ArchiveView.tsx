import type { Task } from '../types'
import { QUADRANTS } from '../lib/quadrants'
import { Archive, RotateCcw, Trash2 } from 'lucide-react'

export type ArchiveViewProps = {
  tasks: Task[]
  onRestore: (id: string) => void
  onDelete: (id: string) => void
  onClearArchive: () => void
}

export function ArchiveView({ tasks, onRestore, onDelete, onClearArchive }: ArchiveViewProps) {
  const archived = tasks.filter((t) => t.archived)

  if (archived.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-12 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        <Archive className="mb-4 h-12 w-12 opacity-40" />
        <p className="text-sm font-medium">No archived tasks</p>
        <p className="mt-1 text-xs opacity-70">Completed tasks that you archive will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Archive</h2>
        <button
          type="button"
          onClick={onClearArchive}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
        >
          <Trash2 className="h-4 w-4" />
          Clear all
        </button>
      </div>

      {QUADRANTS.map((q) => {
        const quadrantTasks = archived
          .filter((t) => t.quadrant === q.id)
          .sort((a, b) => b.createdAt - a.createdAt)
        if (quadrantTasks.length === 0) return null

        const Icon = q.icon

        return (
          <section key={q.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 flex items-center gap-2">
              <Icon className={`h-5 w-5 ${q.accent}`} />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{q.label}</h3>
              <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {quadrantTasks.length}
              </span>
            </div>
            <ul className="space-y-2">
              {quadrantTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800"
                >
                  <span className="flex-1 truncate text-sm text-gray-700 line-through dark:text-gray-300">
                    {task.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRestore(task.id)}
                    className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
                        onDelete(task.id)
                      }
                    }}
                    className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-sm ring-1 ring-red-200 hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:ring-red-900 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
