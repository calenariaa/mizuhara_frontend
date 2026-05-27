import type {
  CreateTaskEntryTemplateRequest,
  UpdateTaskEntryTemplateRequest,
} from '@/modules/tasks/types/request'
import type { TaskEntryTemplate } from '@/types/api/tasks/taskEntryTemplate'

import { useApiClient } from '@/composables/api/useApiClient'
import { TASK_ENTRY_TEMPLATES_ENDPOINT } from '@/modules/tasks/services/endpoints'

export function taskEntryTemplateService() {
  const { del, getCollection, getItem, patch, post, put } = useApiClient()

  return {
    async getAll(): Promise<TaskEntryTemplate[]> {
      const collection = await getCollection<TaskEntryTemplate>(TASK_ENTRY_TEMPLATES_ENDPOINT)
      return collection.items
    },

    async getById(id: number): Promise<TaskEntryTemplate> {
      return getItem<TaskEntryTemplate>(`${TASK_ENTRY_TEMPLATES_ENDPOINT}/${id}`)
    },

    async create(request: CreateTaskEntryTemplateRequest): Promise<TaskEntryTemplate> {
      return post<TaskEntryTemplate, CreateTaskEntryTemplateRequest>(
        TASK_ENTRY_TEMPLATES_ENDPOINT,
        request,
      )
    },

    async replace(id: number, request: CreateTaskEntryTemplateRequest): Promise<TaskEntryTemplate> {
      return put<TaskEntryTemplate, CreateTaskEntryTemplateRequest>(
        `${TASK_ENTRY_TEMPLATES_ENDPOINT}/${id}`,
        request,
      )
    },

    async update(id: number, request: UpdateTaskEntryTemplateRequest): Promise<TaskEntryTemplate> {
      return patch<TaskEntryTemplate, UpdateTaskEntryTemplateRequest>(
        `${TASK_ENTRY_TEMPLATES_ENDPOINT}/${id}`,
        request,
      )
    },

    async remove(id: number): Promise<void> {
      await del(`${TASK_ENTRY_TEMPLATES_ENDPOINT}/${id}`)
    },
  }
}
