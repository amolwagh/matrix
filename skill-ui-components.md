# Skill: ui-components
# Load when: building or editing any component

## Purpose
Component shapes, prop contracts, and layout patterns for Matrix + Lane views.

## Quadrant Config (single source of truth)
```ts
export const QUADRANTS = [
  { id: 'do-first',   label: 'Do First',   icon: 'Zap',       color: 'bg-red-50   border-red-200'   },
  { id: 'strategic',  label: 'Strategic',  icon: 'Target',    color: 'bg-blue-50  border-blue-200'  },
  { id: 'quick-wins', label: 'Quick Wins', icon: 'Bolt',      color: 'bg-yellow-50 border-yellow-200'},
  { id: 'review',     label: 'Review',     icon: 'Archive',   color: 'bg-gray-50  border-gray-200'  },
] as const
```

## Component Shapes

### TaskCard
```ts
// Props
{ task: Task; onEdit: (t: Task) => void; onToggle: (id: string) => void }
// Shows: checkbox, title, due date icon + date, tag pills, note icon if note exists
```

### QuadrantPanel
```ts
// Props
{ quadrant: Quadrant; tasks: Task[]; onAdd: () => void; onEdit: (t: Task) => void }
// Shows: header with icon + label, TaskCard list, + Add button at bottom
```

### Matrix view