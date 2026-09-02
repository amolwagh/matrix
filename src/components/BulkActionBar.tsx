import { useState } from 'react'
import { CheckCheck, Archive, Trash2, ChevronDown, X } from 'lucide-react'
import { QUADRANTS } from '../lib/quadrants'
import type { Quadrant } from '../types'

type BulkActionBarProps = {
  count: number
  onMove: (quadrant: Quadrant) => void
  onDone: () => void
  onArchive: () => void
  onDelete: () => void
  onClear: () => void
}

export function BulkActionBar({ count, onMove, onDone, onArchive, onDelete, onClear }: BulkActionBarProps) {
  const [moveOpen, setMoveOpen] = useState(false)

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <span className="min-w-[5ch] text-sm font-medium text-gray-700 dark:text-gray-300">
        {count} selected
      </span>
      <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

      <div className="relative">
        <button
          type="button"
          onClick={() => setMoveOpen((v) => !v)}
          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Move
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {moveOpen && (
          <div className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 flex-col gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {QUADRANTS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  onMove(q.id)
                  setMoveOpen(false)
                }}
                className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <q.icon className={`h-4 w-4 ${q.accent}`} />
                {q.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDone}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        title="Mark done"
      >
        <CheckCheck className="h-4 w-4" />
        Done
      </button>

      <button
        type="button"
        onClick={onArchive}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        title="Archive"
      >
        <Archive className="h-4 w-4" />
        Archive
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>

      <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

      <button
        type="button"
        onClick={onClear}
        className="flex items-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        title="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
