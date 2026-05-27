import type { Task } from '@/types/api/tasks/task'

export const taskCompletedStatuses = new Set(['completed', 'done'])

export const taskStatusTranslationKeys: Record<string, 'open' | 'inProgress' | 'completed'> = {
  open: 'open',
  in_progress: 'inProgress',
  completed: 'completed',
  done: 'completed',
}

export const isTaskOpen = (task: Pick<Task, 'completedAt' | 'status'>): boolean =>
  !task.completedAt && !taskCompletedStatuses.has(task.status ?? '')
