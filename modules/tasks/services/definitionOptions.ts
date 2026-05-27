export const taskRecurrenceTypeOptions = ['once', 'daily', 'weekly', 'monthly', 'yearly'] as const
export const taskDayOfWeekOptions = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const
export const taskWeekOrdinalOptions = ['first', 'second', 'third', 'fourth', 'last'] as const

export type TaskRecurrenceType = (typeof taskRecurrenceTypeOptions)[number]
export type TaskDayOfWeek = (typeof taskDayOfWeekOptions)[number]
export type TaskWeekOrdinal = (typeof taskWeekOrdinalOptions)[number]

export const DEFAULT_TASK_RECURRENCE_TYPE: TaskRecurrenceType = 'weekly'
export const DEFAULT_TASK_DAY_OF_WEEK: TaskDayOfWeek = 'monday'
export const DEFAULT_TASK_WEEK_ORDINAL: TaskWeekOrdinal = 'first'
