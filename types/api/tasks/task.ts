import type { TaskDefinition } from './taskDefinition'
import type { TaskEntry } from './taskEntry'
import type { BaseEntity } from '../_shared/common'
import type { User } from '../users/user'

export interface Task extends BaseEntity {
  title?: string | null
  description?: string | null
  assignee?: User | string | null
  entries?: Array<TaskEntry | string>
  status?: string | null
  urgency?: string | null
  dueDate?: string | null
  completedAt?: string | null
  startedAt?: string | null
  definition?: TaskDefinition | string | null
}
