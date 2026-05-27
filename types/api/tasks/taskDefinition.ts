import type { TaskEntryTemplate } from './taskEntryTemplate'
import type { BaseEntity } from '../_shared/common'

export interface TaskDefinition extends BaseEntity {
  title?: string | null
  description?: string | null
  urgency?: string | null
  recurrenceType?: string | null
  recurrenceInterval?: number | null
  dayOfWeek?: string | null
  weekOrdinal?: string | null
  active?: boolean
  entryTemplates?: Array<TaskEntryTemplate | string>
}
