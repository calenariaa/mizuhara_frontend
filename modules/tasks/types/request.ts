export type CreateGenericTaskRequest = {
  name?: string
  assignee?: string
}

export type UpdateGenericTaskRequest = {
  name?: string | null
  assignee?: string | null
  status?: string | null
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
