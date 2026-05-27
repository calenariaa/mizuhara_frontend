import type { User } from '@/types/api/users/user'

import { useApiClient } from '@/composables/api/useApiClient'
import { USERS_ENDPOINT } from '@/modules/user/services/endpoints'

export function userService() {
  const { getCollection } = useApiClient()

  return {
    async getAll(): Promise<User[]> {
      const collection = await getCollection<User>(USERS_ENDPOINT)
      return collection.items
    },
  }
}
