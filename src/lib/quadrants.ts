import { Archive, Bolt, Target, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Quadrant } from '../types'

export type QuadrantConfig = {
  id: Quadrant
  label: string
  icon: LucideIcon
  bg: string
  border: string
  accent: string
}

// Single source of truth for quadrant presentation.
// Class strings are literal so Tailwind's scanner picks them up.
export const QUADRANTS: readonly QuadrantConfig[] = [
  { id: 'do-first',   label: 'Do First',   icon: Zap,     bg: 'bg-red-50',    border: 'border-red-200',    accent: 'text-red-600' },
  { id: 'strategic',  label: 'Strategic',  icon: Target,  bg: 'bg-blue-50',   border: 'border-blue-200',   accent: 'text-blue-600' },
  { id: 'quick-wins', label: 'Quick Wins', icon: Bolt,    bg: 'bg-yellow-50', border: 'border-yellow-200', accent: 'text-amber-600' },
  { id: 'review',     label: 'Review',     icon: Archive, bg: 'bg-gray-50',   border: 'border-gray-200',   accent: 'text-gray-500' },
]

export const QUADRANT_MAP = Object.fromEntries(QUADRANTS.map((q) => [q.id, q] as const)) as Record<Quadrant, QuadrantConfig>
