export const taskUrgencyApiValues = {
  emergency: 'EMERGENCY',
  critical: 'CRITICAL',
  important: 'IMPORTANT',
  normal: 'NORMAL',
  whenever: 'WHENEVER',
} as const

export type TaskUrgencyUiValue = keyof typeof taskUrgencyApiValues
export type TaskUrgencyApiValue = (typeof taskUrgencyApiValues)[TaskUrgencyUiValue]

export const taskUrgencyOptions = Object.keys(taskUrgencyApiValues) as TaskUrgencyUiValue[]
export const DEFAULT_TASK_URGENCY: TaskUrgencyUiValue = 'normal'

export const toTaskUrgencyApiValue = (
  urgency: string | null | undefined,
): string | null | undefined => {
  if (urgency === null) return null
  if (urgency === undefined) return undefined

  const normalizedUrgency = urgency.toLowerCase() as TaskUrgencyUiValue
  return taskUrgencyApiValues[normalizedUrgency] ?? urgency
}

export const toUpperEnumApiValue = (
  value: string | null | undefined,
): string | null | undefined => {
  if (value === null) return null
  if (value === undefined) return undefined

  return value.toUpperCase()
}

export const toLowerEnumUiValue = (value: string | null | undefined, fallback: string): string =>
  value?.toLowerCase() ?? fallback
