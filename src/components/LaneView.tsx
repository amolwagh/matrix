import type { Quadrant, Task } from '../types'
import { QUADRANTS } from '../lib/quadrants'
import { QuadrantPanel } from './QuadrantPanel'

export type LaneViewProps = {
  tasks: Task[]
  onAdd: (quadrant: Quadrant) => void
  onEdit: (task: Task) => void
  onToggle: (id: string) => void
  onArchive?: (id: string) => void
  activeTask?: Task | null
  hideCompleted?: boolean
  activeTag?: string | null
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
}

// Single-column stack — each quadrant panel full width. Good for mobile / narrow screens.
export function LaneView({ tasks, onAdd, onEdit, onToggle, onArchive, activeTask = null, hideCompleted = false, activeTag = null, selectedIds, onToggleSelect }: LaneViewProps) {
  return (
    <div className="flex flex-col gap-4">
      {QUADRANTS.map((q) => (
        <QuadrantPanel
          key={q.id}
          quadrant={q.id}
          tasks={tasks.filter((t) => t.quadrant === q.id)}
          onAdd={() => onAdd(q.id)}
          onEdit={onEdit}
          onToggle={onToggle}
          onArchive={onArchive}
          activeTask={activeTask}
          hideCompleted={hideCompleted}
          activeTag={activeTag}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          className={`rounded-lg border ${q.border} shadow-sm`}
        />
      ))}
    </div>
  )
}
