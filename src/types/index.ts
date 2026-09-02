export type Quadrant = 'do-first' | 'strategic' | 'quick-wins' | 'review'

export type ViewMode = 'matrix' | 'lanes' | 'archive'

export type Task = {
  id: string
  title: string
  quadrant: Quadrant
  createdAt: number // Date.now()
  done: boolean
  note?: string
  dueDate?: number // timestamp (ms)
  tags?: string[]
  archived?: boolean
  order: number // sort order within quadrant
}

export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'order'>
