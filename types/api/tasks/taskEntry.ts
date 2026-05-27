import type { GenericTask } from './genericTask'
import type { BaseEntity } from '../_shared/common'
import type { User } from '../users/user'

export interface TaskEntry extends BaseEntity {
  task?: GenericTask | string
  description: string
  sortOrder: number
  completedAt?: string | null
  completedBy?: User | string | null
}
