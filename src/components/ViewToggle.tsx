import { useState } from 'react'
import { AlignJustify, Archive, BarChart2, Eye, EyeOff, LayoutGrid, Moon, Search, Sun, Tags } from 'lucide-react'
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
  dark: boolean
  onDarkChange: (value: boolean) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  searchCount: number
}

const OPTIONS: ReadonlyArray<{ id: ViewMode; label: string; icon: LucideIcon }> = [
  { id: 'matrix', label: 'Matrix', icon: LayoutGrid },
  { id: 'lanes', label: 'Lanes', icon: AlignJustify },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'stats', label: 'Stats', icon: BarChart2 },
]

export function ViewToggle({
  view,
  onChange,
  hideCompleted,
  onHideCompletedChange,
  activeTag,
  tags,
  onActiveTagChange,
  dark,
  onDarkChange,
  searchQuery,
  onSearchChange,
  searchCount,
}: ViewToggleProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label="View mode"
        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800"
      >
        {OPTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={view === id}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              view === id ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-all ${searchFocused || searchQuery ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950' : 'border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800'}`}>
        <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onSearchChange('')
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          placeholder="Search..."
          className={`bg-transparent text-xs font-medium text-gray-700 outline-none transition-all placeholder:text-gray-400 dark:text-gray-300 dark:placeholder:text-gray-500 ${searchFocused ? 'w-24 sm:w-32' : 'w-12 sm:w-16'}`}
        />
        {searchQuery && (
          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            {searchCount}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onHideCompletedChange(!hideCompleted)}
        aria-pressed={hideCompleted}
        title="Hide completed tasks"
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
          hideCompleted
            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300'
            : 'border-gray-200 bg-gray-100 text-gray-500 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        {hideCompleted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="hidden sm:inline">Hide done</span>
      </button>

      {tags.length > 0 && (
        <label
          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 ${
            activeTag ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-950' : 'border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800'
          }`}
        >
          <Tags className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <select
            value={activeTag ?? ''}
            onChange={(e) => onActiveTagChange(e.target.value || null)}
            aria-label="Filter by tag"
            className="cursor-pointer bg-transparent text-xs font-medium text-gray-700 outline-none sm:text-sm dark:text-gray-300"
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

      <button
        type="button"
        onClick={() => onDarkChange(!dark)}
        aria-pressed={dark}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
          dark
            ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
            : 'border-gray-200 bg-gray-100 text-gray-500 hover:text-gray-800'
        }`}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="hidden sm:inline">{dark ? 'Light mode' : 'Dark mode'}</span>
      </button>
    </div>
  )
}
