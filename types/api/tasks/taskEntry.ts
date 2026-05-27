import type { Task } from './task'
import type { BaseEntity } from '../_shared/common'
import type { User } from '../users/user'

export interface TaskEntry extends BaseEntity {
  task?: Task | string
  description?: string | null
  sortOrder?: number | null
  completedAt?: string | null
  completedBy?: User | string | null
}
