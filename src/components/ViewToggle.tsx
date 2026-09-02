import { AlignJustify, Eye, EyeOff, LayoutGrid, Tags } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ViewMode } from '../types'

export type ViewToggleProps = {
  view: ViewMode
  onChange: (view: ViewMode) => void
  hideCompleted: boolean
  onHideCompletedChange: (value: boolean) => void
  activeTag: string | null
  tags: readonly string[]
  onActiveTagChange: (tag: string | null) => void
}

const OPTIONS: ReadonlyArray<{ id: ViewMode; label: string; icon: LucideIcon }> = [
  { id: 'matrix', label: 'Matrix', icon: LayoutGrid },
  { id: 'lanes', label: 'Lanes', icon: AlignJustify },
]

export function ViewToggle({
  view,
  onChange,
  hideCompleted,
  onHideCompletedChange,
  activeTag,
  tags,
  onActiveTagChange,
}: ViewToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label="View mode"
        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1"
      >
        {OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={view === id}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              view === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onHideCompletedChange(!hideCompleted)}
        aria-pressed={hideCompleted}
        title="Hide completed tasks"
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
          hideCompleted
            ? 'border-blue-600 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-gray-100 text-gray-500 hover:text-gray-800'
        }`}
      >
        {hideCompleted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="hidden sm:inline">Hide done</span>
      </button>

      {tags.length > 0 && (
        <label
          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 ${
            activeTag ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-gray-100'
          }`}
        >
          <Tags className="h-4 w-4 text-gray-500" />
          <select
            value={activeTag ?? ''}
            onChange={(e) => onActiveTagChange(e.target.value || null)}
            aria-label="Filter by tag"
            className="cursor-pointer bg-transparent text-xs font-medium text-gray-700 outline-none sm:text-sm"
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
