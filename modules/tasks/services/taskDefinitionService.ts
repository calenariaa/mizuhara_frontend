import type {
  CreateTaskDefinitionRequest,
  UpdateTaskDefinitionRequest,
} from '@/modules/tasks/types/request'
import type { TaskDefinition } from '@/types/api/tasks/taskDefinition'

import { useApiClient } from '@/composables/api/useApiClient'
import { TASK_DEFINITIONS_ENDPOINT } from '@/modules/tasks/services/endpoints'
import { toTaskUrgencyApiValue, toUpperEnumApiValue } from '@/modules/tasks/services/urgency'

export function taskDefinitionService() {
  const { del, getCollection, getItem, patch, post } = useApiClient()

  return {
    async getAll(): Promise<TaskDefinition[]> {
      const collection = await getCollection<TaskDefinition>(TASK_DEFINITIONS_ENDPOINT)
      return collection.items
    },

    async getById(id: number): Promise<TaskDefinition> {
      return getItem<TaskDefinition>(`${TASK_DEFINITIONS_ENDPOINT}/${id}`)
    },

    async create(request: CreateTaskDefinitionRequest): Promise<TaskDefinition> {
      return post<TaskDefinition, CreateTaskDefinitionRequest>(TASK_DEFINITIONS_ENDPOINT, {
        ...request,
        urgency: toTaskUrgencyApiValue(request.urgency),
        recurrenceType: toUpperEnumApiValue(request.recurrenceType),
        dayOfWeek: toUpperEnumApiValue(request.dayOfWeek),
        weekOrdinal: toUpperEnumApiValue(request.weekOrdinal),
      })
    },

    async update(id: number, request: UpdateTaskDefinitionRequest): Promise<TaskDefinition> {
      return patch<TaskDefinition, UpdateTaskDefinitionRequest>(
        `${TASK_DEFINITIONS_ENDPOINT}/${id}`,
        {
          ...request,
          urgency: toTaskUrgencyApiValue(request.urgency),
          recurrenceType: toUpperEnumApiValue(request.recurrenceType),
          dayOfWeek: toUpperEnumApiValue(request.dayOfWeek),
          weekOrdinal: toUpperEnumApiValue(request.weekOrdinal),
        },
      )
    },

    async remove(id: number): Promise<void> {
      await del(`${TASK_DEFINITIONS_ENDPOINT}/${id}`)
    },
  }
}
