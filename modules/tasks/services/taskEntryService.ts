import type {
  CreateTaskEntryRequest,
  ReplaceTaskEntryRequest,
  UpdateTaskEntryRequest,
} from '@/modules/tasks/types/request'
import type { TaskEntry } from '@/types/api/tasks/taskEntry'

import { useApiClient } from '@/composables/api/useApiClient'
import { TASK_ENTRIES_ENDPOINT } from '@/modules/tasks/services/endpoints'

export function taskEntryService() {
  const { del, getCollection, getItem, patch, post, put } = useApiClient()

  return {
    async getAll(): Promise<TaskEntry[]> {
      const collection = await getCollection<TaskEntry>(TASK_ENTRIES_ENDPOINT)
      return collection.items
    },

    async getById(id: number): Promise<TaskEntry> {
      return getItem<TaskEntry>(`${TASK_ENTRIES_ENDPOINT}/${id}`)
    },

    async create(entryRequest: CreateTaskEntryRequest): Promise<TaskEntry> {
      return post<TaskEntry, CreateTaskEntryRequest>(TASK_ENTRIES_ENDPOINT, entryRequest)
    },

    async replace(id: number, entryRequest: ReplaceTaskEntryRequest): Promise<TaskEntry> {
      return put<TaskEntry, ReplaceTaskEntryRequest>(`${TASK_ENTRIES_ENDPOINT}/${id}`, entryRequest)
    },

    async update(id: number, entryRequest: UpdateTaskEntryRequest): Promise<TaskEntry> {
      return patch<TaskEntry, UpdateTaskEntryRequest>(
        `${TASK_ENTRIES_ENDPOINT}/${id}`,
        entryRequest,
      )
    },

    async remove(id: number): Promise<void> {
      await del(`${TASK_ENTRIES_ENDPOINT}/${id}`)
    },
  }
}
