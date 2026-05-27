export type CreateGenericTaskRequest = {
  assignee?: string
}

export type UpdateGenericTaskRequest = {
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
