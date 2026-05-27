import type { TaskEntry } from './taskEntry'
import type { BaseEntity } from '../_shared/common'
import type { User } from '../users/user'

export type GenericTaskStatus = string

export interface GenericTask extends BaseEntity {
  name?: string | null
  assignee?: User | string | null
  entries?: Array<TaskEntry | string>
  status?: GenericTaskStatus | null
  completedAt?: string | null
  startedAt?: string | null
}
