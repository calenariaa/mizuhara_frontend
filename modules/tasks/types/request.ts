export type CreateTaskRequest = {
  title?: string
  description?: string | null
  assignee?: string | null
  urgency?: string | null
  dueDate?: string | null
}

export type UpdateTaskRequest = {
  title?: string | null
  description?: string | null
  assignee?: string | null
  urgency?: string | null
  dueDate?: string | null
}

export type CreateTaskDefinitionRequest = {
  title?: string
  description?: string | null
  urgency?: string | null
  recurrenceType?: string | null
  recurrenceInterval?: number | null
  dayOfWeek?: string | null
  weekOrdinal?: string | null
}

export type UpdateTaskDefinitionRequest = {
  title?: string | null
  description?: string | null
  urgency?: string | null
  recurrenceType?: string | null
  recurrenceInterval?: number | null
  dayOfWeek?: string | null
  weekOrdinal?: string | null
}

export type CreateTaskEntryRequest = {
  task: string
  description: string
  sortOrder?: number
}

export type UpdateTaskEntryRequest = {
  description?: string
  sortOrder?: number
}

export type ReplaceTaskEntryRequest = {
  task: string
  description: string
  sortOrder: number
}

export type CreateTaskEntryTemplateRequest = {
  definition: string
  description: string
  sortOrder?: number
}

export type UpdateTaskEntryTemplateRequest = {
  description?: string | null
  sortOrder?: number | null
}
