import type {
  CreateGenericTaskRequest,
  UpdateGenericTaskRequest,
} from '@/modules/tasks/types/request'
import type { GenericTask } from '@/types/api/tasks/genericTask'

import { useApiClient } from '@/composables/api/useApiClient'
import { GENERIC_TASKS_ENDPOINT } from '@/modules/tasks/services/endpoints'

export function genericTaskService() {
  const { del, getCollection, getItem, patch, post } = useApiClient()

  return {
    async getAll(): Promise<GenericTask[]> {
      const collection = await getCollection<GenericTask>(GENERIC_TASKS_ENDPOINT)
      return collection.items
    },

    async getById(id: number): Promise<GenericTask> {
      return getItem<GenericTask>(`${GENERIC_TASKS_ENDPOINT}/${id}`)
    },

    async create(taskRequest: CreateGenericTaskRequest): Promise<GenericTask> {
      return post<GenericTask, CreateGenericTaskRequest>(GENERIC_TASKS_ENDPOINT, taskRequest)
    },

    async update(id: number, taskRequest: UpdateGenericTaskRequest): Promise<GenericTask> {
      return patch<GenericTask, UpdateGenericTaskRequest>(
        `${GENERIC_TASKS_ENDPOINT}/${id}`,
        taskRequest,
      )
    },

    async remove(id: number): Promise<void> {
      await del(`${GENERIC_TASKS_ENDPOINT}/${id}`)
    },
  }
}
