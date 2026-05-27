import type { CreateTaskRequest, UpdateTaskRequest } from '@/modules/tasks/types/request'
import type { Task } from '@/types/api/tasks/task'

import { useApiClient } from '@/composables/api/useApiClient'
import { TASKS_ENDPOINT } from '@/modules/tasks/services/endpoints'
import { toTaskUrgencyApiValue } from '@/modules/tasks/services/urgency'

export function taskService() {
  const { del, getCollection, getItem, patch, post } = useApiClient()

  return {
    async getAll(): Promise<Task[]> {
      const collection = await getCollection<Task>(TASKS_ENDPOINT)
      return collection.items
    },

    async getById(id: number): Promise<Task> {
      return getItem<Task>(`${TASKS_ENDPOINT}/${id}`)
    },

    async create(taskRequest: CreateTaskRequest): Promise<Task> {
      return post<Task, CreateTaskRequest>(TASKS_ENDPOINT, {
        ...taskRequest,
        urgency: toTaskUrgencyApiValue(taskRequest.urgency),
      })
    },

    async update(id: number, taskRequest: UpdateTaskRequest): Promise<Task> {
      return patch<Task, UpdateTaskRequest>(`${TASKS_ENDPOINT}/${id}`, {
        ...taskRequest,
        urgency: toTaskUrgencyApiValue(taskRequest.urgency),
      })
    },

    async remove(id: number): Promise<void> {
      await del(`${TASKS_ENDPOINT}/${id}`)
    },
  }
}
