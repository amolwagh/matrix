import { useEffect, useMemo, useState } from 'react'
import type { Quadrant, Task, TaskDraft, ViewMode } from './types'
import { loadView, saveView } from './lib/storage'
import { QUADRANTS } from './lib/quadrants'
import { useTasks } from './hooks/useTasks'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { QuadrantPanel, TaskCardBody } from './components/QuadrantPanel'
import { LaneView } from './components/LaneView'
import { ViewToggle } from './components/ViewToggle'
import { AddTaskModal } from './components/AddTaskModal'

type ModalState = { mode: 'add'; quadrant: Quadrant } | { mode: 'edit'; task: Task }

// 2px center dividers for the 2x2 matrix grid (grid reading order).
const MATRIX_DIVIDERS = ['border-r-2 border-b-2', 'border-b-2', 'border-r-2', '']

export default function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleDone, reorderTasks, moveToQuadrant } = useTasks()
  const [view, setView] = useState<ViewMode>(loadView)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [hideCompleted, setHideCompleted] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(
    () => [...new Set(tasks.flatMap((t) => t.tags ?? []))].sort((a, b) => a.localeCompare(b)),
    [tasks],
  )

  const changeView = (next: ViewMode) => {
    setView(next)
    saveView(next)
  }

  const openAdd = (quadrant: Quadrant) => setModal({ mode: 'add', quadrant })
  const openEdit = (task: Task) => setModal({ mode: 'edit', task })

  const handleSave = (draft: TaskDraft) => {
    if (modal && modal.mode === 'edit') updateTask(modal.task.id, draft)
    else addTask(draft)
    setModal(null)
  }

  const handleDelete = (id: string) => {
    deleteTask(id)
    setModal(null)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (modal) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      ) {
        return
      }
      if (e.key === 'n' || e.key === 'N' || e.key === '/') {
        e.preventDefault()
        setModal({ mode: 'add', quadrant: 'do-first' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modal])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Board-level drag handling: reorder within a quadrant, or move across quadrants.
  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find((t) => t.id === event.active.id) ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const overId = over.id

    const dragged = tasks.find((t) => t.id === active.id)
    if (!dragged) return

    // Target quadrant: the hovered task's quadrant, or a quadrant drop zone.
    let targetQuadrant: Quadrant | null = null
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask) {
      targetQuadrant = overTask.quadrant
    } else if (QUADRANTS.some((q) => q.id === overId)) {
      targetQuadrant = overId as Quadrant
    }
    if (!targetQuadrant) return

    if (targetQuadrant === dragged.quadrant) {
      // Same quadrant: reorder. Dropping on the zone means "move to end".
      const sorted = tasks.filter((t) => t.quadrant === targetQuadrant).sort((a, b) => a.order - b.order)
      const fromIndex = sorted.findIndex((t) => t.id === dragged.id)
      const toIndex = overTask ? sorted.findIndex((t) => t.id === overTask.id) : sorted.length - 1
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
      reorderTasks(targetQuadrant, fromIndex, toIndex)
    } else {
      moveToQuadrant(dragged.id, targetQuadrant)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900">
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <h1 className="text-lg font-bold tracking-tight">Eisenhower Matrix</h1>
        <ViewToggle
          view={view}
          onChange={changeView}
          hideCompleted={hideCompleted}
          onHideCompletedChange={setHideCompleted}
          activeTag={activeTag}
          tags={allTags}
          onActiveTagChange={setActiveTag}
        />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={view === 'lanes' ? [restrictToVerticalAxis] : []}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveTask(null)}
        >
          {view === 'matrix' ? (
            <div className="grid grid-cols-2 grid-rows-2 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
              {QUADRANTS.map((q, i) => (
                <QuadrantPanel
                  key={q.id}
                  quadrant={q.id}
                  tasks={tasks.filter((t) => t.quadrant === q.id)}
                  onAdd={() => openAdd(q.id)}
                  onEdit={openEdit}
                  onToggle={toggleDone}
                  activeTask={activeTask}
                  hideCompleted={hideCompleted}
                  activeTag={activeTag}
                  className={`${MATRIX_DIVIDERS[i]} border-gray-300`}
                />
              ))}
            </div>
          ) : (
            <LaneView tasks={tasks} onAdd={openAdd} onEdit={openEdit} onToggle={toggleDone} activeTask={activeTask} hideCompleted={hideCompleted} activeTag={activeTag} />
          )}

          <DragOverlay>{activeTask ? <TaskCardBody task={activeTask} /> : null}</DragOverlay>
        </DndContext>
      </main>

      {modal && (
        <AddTaskModal
          mode={modal.mode}
          task={modal.mode === 'edit' ? modal.task : undefined}
          defaultQuadrant={modal.mode === 'add' ? modal.quadrant : undefined}
          onSave={handleSave}
          onClose={() => setModal(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
