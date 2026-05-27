import type { TaskDefinition } from './taskDefinition'
import type { BaseEntity } from '../_shared/common'

export interface TaskEntryTemplate extends BaseEntity {
  definition?: TaskDefinition | string | null
  description?: string | null
  sortOrder?: number | null
}
