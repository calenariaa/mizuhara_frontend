import type { User } from '@/types/api/users/user'

import { useApiClient } from '@/composables/api/useApiClient'

export function userService() {
  const { getCollection } = useApiClient()

  return {
    async getAll(): Promise<User[]> {
      const data = await getCollection<User>('/api/users')
      return data.items
    },
  }
}
