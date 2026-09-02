import type { ReactNode } from 'react'
import { Archive, Calendar, GripVertical, Plus, StickyNote } from 'lucide-react'
import { format } from 'date-fns'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Quadrant, Task } from '../types'
import { QUADRANT_MAP } from '../lib/quadrants'

export type QuadrantPanelProps = {
  quadrant: Quadrant
  tasks: Task[]
  onAdd: () => void
  onEdit: (task: Task) => void
  onToggle: (id: string) => void
  onArchive?: (id: string) => void
  activeTask?: Task | null
  hideCompleted?: boolean
  activeTag?: string | null
  className?: string
}

type TaskCardProps = {
  task: Task
  onEdit?: (task: Task) => void
  onToggle?: (id: string) => void
  onArchive?: (id: string) => void
  dragHandle?: ReactNode
}

export function TaskCardBody({ task, onEdit, onToggle, onArchive, dragHandle }: TaskCardProps) {
  const overdue = task.dueDate !== undefined && !task.done && task.dueDate < Date.now()
  const hasMeta =
    task.dueDate !== undefined || task.note !== undefined || (task.tags?.length ?? 0) > 0

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle?.(task.id)}
          aria-label={`Mark "${task.title}" as ${task.done ? 'not done' : 'done'}`}
          className="mt-0.5 h-4 w-4 shrink-0 accent-gray-700"
        />
        <button
          type="button"
          onClick={() => onEdit?.(task)}
          title="Edit task"
          className={`min-w-0 flex-1 truncate text-left text-sm font-medium ${
            task.done ? 'text-gray-400 line-through opacity-60' : 'text-gray-800 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-300'
          }`}
        >
          {task.title}
        </button>
        {task.done && onArchive && (
          <button
            type="button"
            onClick={() => onArchive(task.id)}
            title="Archive task"
            className="-m-1 shrink-0 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label={`Archive "${task.title}"`}
          >
            <Archive className="h-4 w-4" />
          </button>
        )}
        {dragHandle}
      </div>

      {hasMeta && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 pl-[26px]">
          {task.dueDate !== undefined && (
            <span
              className={`flex items-center gap-1 text-xs ${
                overdue ? 'font-semibold text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(task.dueDate), 'dd MMM yyyy')}
            </span>
          )}
          {task.note !== undefined && (
            <StickyNote
              className={`h-3.5 w-3.5 ${task.done ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}
              aria-label="Has note"
            />
          )}
          {(task.tags ?? []).map((tag) => (
            <span key={tag} className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function SortableTaskCard({ task, onEdit, onToggle, onArchive }: Omit<TaskCardProps, 'dragHandle'>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'opacity-40' : undefined}
    >
      <TaskCardBody
        task={task}
        onEdit={onEdit}
        onToggle={onToggle}
        onArchive={onArchive}
        dragHandle={
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reorder "${task.title}"`}
            className="-m-1 shrink-0 cursor-grab touch-none rounded p-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing dark:hover:text-gray-300"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        }
      />
    </div>
  )
}

export function QuadrantPanel({ quadrant, tasks, onAdd, onEdit, onToggle, onArchive, activeTask = null, hideCompleted = false, activeTag = null, className = '' }: QuadrantPanelProps) {
  const cfg = QUADRANT_MAP[quadrant]
  const Icon = cfg.icon
  const visible = tasks
    .filter((t) => {
      if (t.archived) return false
      if (hideCompleted && t.done) return false
      if (activeTag && !(t.tags ?? []).includes(activeTag)) return false
      return true
    })
    .sort((a, b) => a.order - b.order)

  // This panel's list area is a drop zone for tasks dragged in from other quadrants.
  const { setNodeRef, isOver } = useDroppable({ id: quadrant })
  const zoneHighlighted = isOver && activeTask !== null && activeTask.quadrant !== quadrant

  return (
    <section className={`flex min-h-0 flex-col ${cfg.bg} dark:bg-gray-900 ${className}`}>
      <header className="flex items-center gap-2 px-4 py-3">
        <Icon className={`h-5 w-5 shrink-0 ${cfg.accent}`} />
        <h2 className="truncate text-sm font-semibold tracking-wide text-gray-800 dark:text-gray-200">{cfg.label}</h2>
        <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700/80 dark:text-gray-300">
          {visible.length === tasks.length ? visible.length : `${visible.length}/${tasks.length}`}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 overflow-y-auto rounded-md p-3 pt-0 transition-shadow ${zoneHighlighted ? 'ring-2 ring-inset ring-indigo-400' : ''}`}
      >
        {visible.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">
            {tasks.length === 0 ? 'No tasks yet' : 'No tasks match the current filter'}
          </p>
        ) : (
          <SortableContext items={visible.map((t) => t.id)}>
            {visible.map((task) => (
              <SortableTaskCard key={task.id} task={task} onEdit={onEdit} onToggle={onToggle} onArchive={onArchive} />
            ))}
          </SortableContext>
        )}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="m-3 mt-1 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:bg-white/60 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      >
        <Plus className="h-4 w-4" /> Add task
      </button>
    </section>
  )
}
