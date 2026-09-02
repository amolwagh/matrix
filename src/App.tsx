import { useEffect, useMemo, useRef, useState } from 'react'
import { Download } from 'lucide-react'
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
import { ArchiveView } from './components/ArchiveView'
import { AddTaskModal } from './components/AddTaskModal'
import { BulkActionBar } from './components/BulkActionBar'

type ModalState = { mode: 'add'; quadrant: Quadrant } | { mode: 'edit'; task: Task }

// 2px center dividers for the 2x2 matrix grid (grid reading order).
const MATRIX_DIVIDERS = ['border-r-2 border-b-2', 'border-b-2', 'border-r-2', '']

export default function App() {
  const { tasks, addTask, updateTask, deleteTask, toggleDone, reorderTasks, moveToQuadrant, importTasks, archiveTask, restoreTask, clearArchive } = useTasks()
  const activeTasks = tasks.filter((t) => !t.archived)
  const [view, setView] = useState<ViewMode>(loadView)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [hideCompleted, setHideCompleted] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem('em_dark') === 'true')

  // Apply the saved preference on mount and keep <html> + localStorage in sync.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('em_dark', String(dark))
  }, [dark])
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allTags = useMemo(
    () => [...new Set(activeTasks.flatMap((t) => t.tags ?? []))].sort((a, b) => a.localeCompare(b)),
    [activeTasks],
  )

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return tasks.filter((t) => {
      if (t.archived) return false
      if (!q) return true
      if (t.title.toLowerCase().includes(q)) return true
      if ((t.note ?? '').toLowerCase().includes(q)) return true
      if ((t.tags ?? []).some((tag) => tag.toLowerCase().includes(q))) return true
      return false
    })
  }, [tasks, searchQuery])

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

  const handleExport = () => {
    const json = JSON.stringify(tasks, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'eisenhower-backup.json'
    a.click()
    URL.revokeObjectURL(url)
    setMenuOpen(false)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed)) throw new Error('Invalid format')
        const validQuadrants: Quadrant[] = ['do-first', 'strategic', 'quick-wins', 'review']
        const valid = parsed.every(
          (t: unknown) =>
            t !== null &&
            typeof t === 'object' &&
            'id' in t &&
            typeof (t as { id: unknown }).id === 'string' &&
            'title' in t &&
            typeof (t as { title: unknown }).title === 'string' &&
            'quadrant' in t &&
            validQuadrants.includes((t as { quadrant: unknown }).quadrant as Quadrant),
        )
        if (!valid) throw new Error('Invalid task shape')
        if (!window.confirm('This will replace all tasks. Continue?')) return
        importTasks(parsed as Task[])
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Import failed')
      } finally {
        setMenuOpen(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const clearSelected = () => setSelected(new Set())

  const bulkMove = (quadrant: Quadrant) => {
    selected.forEach((id) => moveToQuadrant(id, quadrant))
    clearSelected()
  }

  const bulkDone = () => {
    selected.forEach((id) => updateTask(id, { done: true }))
    clearSelected()
  }

  const bulkArchive = () => {
    selected.forEach((id) => archiveTask(id))
    clearSelected()
  }

  const bulkDelete = () => {
    if (!window.confirm(`Delete ${selected.size} selected task(s)? This cannot be undone.`)) return
    selected.forEach((id) => deleteTask(id))
    clearSelected()
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

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Board-level drag handling: reorder within a quadrant, or move across quadrants.
  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(activeTasks.find((t) => t.id === event.active.id) ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const overId = over.id

    const dragged = activeTasks.find((t) => t.id === active.id)
    if (!dragged) return

    // Target quadrant: the hovered task's quadrant, or a quadrant drop zone.
    let targetQuadrant: Quadrant | null = null
    const overTask = activeTasks.find((t) => t.id === overId)
    if (overTask) {
      targetQuadrant = overTask.quadrant
    } else if (QUADRANTS.some((q) => q.id === overId)) {
      targetQuadrant = overId as Quadrant
    }
    if (!targetQuadrant) return

    if (targetQuadrant === dragged.quadrant) {
      // Same quadrant: reorder. Dropping on the zone means "move to end".
      const sorted = activeTasks.filter((t) => t.quadrant === targetQuadrant).sort((a, b) => a.order - b.order)
      const fromIndex = sorted.findIndex((t) => t.id === dragged.id)
      const toIndex = overTask ? sorted.findIndex((t) => t.id === overTask.id) : sorted.length - 1
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
      reorderTasks(targetQuadrant, fromIndex, toIndex)
    } else {
      moveToQuadrant(dragged.id, targetQuadrant)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-lg font-bold tracking-tight">Eisenhower Matrix</h1>
        <div className="flex items-center gap-2">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Backup options"
              title="Backup options"
            >
              <Download size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={handleExport}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Import JSON
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
          <ViewToggle
            view={view}
            onChange={changeView}
            hideCompleted={hideCompleted}
            onHideCompletedChange={setHideCompleted}
            activeTag={activeTag}
            tags={allTags}
            onActiveTagChange={setActiveTag}
            dark={dark}
            onDarkChange={setDark}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchCount={filteredTasks.length}
          />
        </div>
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
          {view === 'archive' ? (
            <ArchiveView
              tasks={tasks}
              onRestore={restoreTask}
              onDelete={deleteTask}
              onClearArchive={clearArchive}
            />
          ) : view === 'matrix' ? (
            <div className="grid grid-cols-2 grid-rows-2 overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
              {QUADRANTS.map((q, i) => (
                <QuadrantPanel
                  key={q.id}
                  quadrant={q.id}
                  tasks={filteredTasks.filter((t) => t.quadrant === q.id)}
                  onAdd={() => openAdd(q.id)}
                  onEdit={openEdit}
                  onToggle={toggleDone}
                  onArchive={archiveTask}
                  activeTask={activeTask}
                  hideCompleted={hideCompleted}
                  activeTag={activeTag}
                  selectedIds={selected}
                  onToggleSelect={toggleSelected}
                  className={`${MATRIX_DIVIDERS[i]} border-gray-300 dark:border-gray-700`}
                />
              ))}
            </div>
          ) : (
            <LaneView tasks={filteredTasks} onAdd={openAdd} onEdit={openEdit} onToggle={toggleDone} onArchive={archiveTask} activeTask={activeTask} hideCompleted={hideCompleted} activeTag={activeTag} />
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

      {selected.size > 0 && (
        <BulkActionBar
          count={selected.size}
          onMove={bulkMove}
          onDone={bulkDone}
          onArchive={bulkArchive}
          onDelete={bulkDelete}
          onClear={clearSelected}
        />
      )}
    </div>
  )
}
