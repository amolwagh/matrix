import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import type { Quadrant, Task, TaskDraft } from '../types'
import { QUADRANTS } from '../lib/quadrants'

export type AddTaskModalProps = {
  mode: 'add' | 'edit'
  task?: Task
  defaultQuadrant?: Quadrant
  onSave: (draft: TaskDraft) => void
  onClose: () => void
  onDelete?: (id: string) => void
}

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

// Anchor due dates at local noon so "due today" is not overdue from midnight.
function dueDateToTimestamp(value: string): number | undefined {
  if (!value) return undefined
  const ts = new Date(`${value}T12:00:00`).getTime()
  return Number.isNaN(ts) ? undefined : ts
}

const fieldClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/30'

export function AddTaskModal({ mode, task, defaultQuadrant, onSave, onClose, onDelete }: AddTaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [quadrant, setQuadrant] = useState<Quadrant>(task?.quadrant ?? defaultQuadrant ?? 'do-first')
  const [note, setNote] = useState(task?.note ?? '')
  const [dueDate, setDueDate] = useState(
    task?.dueDate !== undefined ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
  )
  const [tagsInput, setTagsInput] = useState((task?.tags ?? []).join(', '))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      quadrant,
      done: task?.done ?? false,
      note: note.trim() || undefined,
      dueDate: dueDateToTimestamp(dueDate),
      tags: parseTags(tagsInput),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 dark:bg-black/60" onMouseDown={onClose}>
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-gray-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{mode === 'add' ? 'Add task' : 'Edit task'}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Title *
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Quadrant
            <select value={quadrant} onChange={(e) => setQuadrant(e.target.value as Quadrant)} className={fieldClass}>
              {QUADRANTS.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Due date
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Note
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional details…" className={`${fieldClass} resize-none`} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags
            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="work, home (comma separated)" className={fieldClass} />
          </label>
        </div>

        <div className="mt-5 flex items-center gap-2">
          {mode === 'edit' && onDelete && task && (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              Delete
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mode === 'add' ? 'Add task' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
