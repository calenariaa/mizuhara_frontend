import type { CreateUserRequest, UpdateUserRequest } from '@/modules/user/types/request'
import type { User } from '@/types/api/users/user'

import { useApiClient } from '@/composables/api/useApiClient'
import { USERS_ENDPOINT } from '@/modules/user/services/endpoints'

export function userService() {
  const { del, getCollection, getItem, patch, post } = useApiClient()

  return {
    async getAll(): Promise<User[]> {
      const collection = await getCollection<User>(USERS_ENDPOINT)
      return collection.items
    },

    async getById(id: number): Promise<User> {
      return getItem<User>(`${USERS_ENDPOINT}/${id}`)
    },

    async create(userRequest: CreateUserRequest): Promise<User> {
      return post<User, CreateUserRequest>(USERS_ENDPOINT, userRequest)
    },

    async update(id: number, userRequest: UpdateUserRequest): Promise<User> {
      return patch<User, UpdateUserRequest>(`${USERS_ENDPOINT}/${id}`, userRequest)
    },

    async remove(id: number): Promise<void> {
      await del(`${USERS_ENDPOINT}/${id}`)
    },
  }
}
