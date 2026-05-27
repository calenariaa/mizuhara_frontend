const MILLISECONDS_PER_DAY = 86_400_000

export const TASK_DUE_DATE_URGENT_DAYS = 3
export const TASK_DUE_DATE_SOON_DAYS = 7
export const TASK_DUE_DATE_HOME_LIMIT = 4

export type TaskDueDateState = 'neutral' | 'soon' | 'urgent' | 'overdue'

export const taskDueDateStateClass: Record<TaskDueDateState, string> = {
  neutral: 'dueDateNeutral',
  soon: 'dueDateSoon',
  urgent: 'dueDateUrgent',
  overdue: 'dueDateOverdue',
}

export type TaskDueDateInfo = {
  date: Date
  daysRemaining: number
  state: TaskDueDateState
}

export const getTaskDueDateInfo = (value: string | null | undefined): TaskDueDateInfo | null => {
  if (!value) return null

  const dueDate = new Date(value)
  if (Number.isNaN(dueDate.getTime())) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDay = new Date(dueDate)
  dueDay.setHours(0, 0, 0, 0)

  const daysRemaining = Math.ceil((dueDay.getTime() - today.getTime()) / MILLISECONDS_PER_DAY)

  if (daysRemaining < 0) return { date: dueDate, daysRemaining, state: 'overdue' }
  if (daysRemaining <= TASK_DUE_DATE_URGENT_DAYS) return { date: dueDate, daysRemaining, state: 'urgent' }
  if (daysRemaining <= TASK_DUE_DATE_SOON_DAYS) return { date: dueDate, daysRemaining, state: 'soon' }

  return { date: dueDate, daysRemaining, state: 'neutral' }
}

export const getTaskDueDateStateClass = (value: string | null | undefined): string => {
  const dueDateInfo = getTaskDueDateInfo(value)

  return taskDueDateStateClass[dueDateInfo?.state ?? 'neutral']
}

export const formatTaskDueDate = (value: string | null | undefined, fallback: string): string => {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
