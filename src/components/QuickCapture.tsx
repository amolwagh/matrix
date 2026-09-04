import React, { useState, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'

export function QuickCapture() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const { addTask } = useTasks()

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Handle shortcut 'c'
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'c') {
        // Prevent if user is typing in an input
        const target = event.target as HTMLElement
        if (target.tagName !== 'INPUT') {
          event.preventDefault()
          setIsOpen((prev) => !prev)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    addTask({
      title: inputValue.trim(),
      quadrant: 'review',
      done: false,
      order: Date.now(), // Temporary order
      tags: [],
    })

    setInputValue('')
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-72 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 rounded-xl border border-gray-300 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900"
          >
            <input
              autoFocus
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Quick capture..."
              className="w-full rounded-md border-none bg-transparent px-2 py-1 text-sm outline-none dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 dark:bg-indigo-500"
        aria-label="Quick capture"
      >
        <Plus className="h-7 w-7" />
      </button>
    </div>
  )
}
