import type { Quadrant, Task } from '../types'
import { QUADRANTS } from '../lib/quadrants'
import { QuadrantPanel } from './QuadrantPanel'

export type LaneViewProps = {
  tasks: Task[]
  onAdd: (quadrant: Quadrant) => void
  onEdit: (task: Task) => void
  onToggle: (id: string) => void
  activeTask?: Task | null
  hideCompleted?: boolean
  activeTag?: string | null
}

// Single-column stack — each quadrant panel full width. Good for mobile / narrow screens.
export function LaneView({ tasks, onAdd, onEdit, onToggle, activeTask = null, hideCompleted = false, activeTag = null }: LaneViewProps) {
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
          activeTask={activeTask}
          hideCompleted={hideCompleted}
          activeTag={activeTag}
          className={`rounded-lg border ${q.border} shadow-sm`}
        />
      ))}
    </div>
  )
}
