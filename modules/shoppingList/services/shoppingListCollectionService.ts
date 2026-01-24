import type { ShoppingListCollection } from '~/types/api/shoppingList/shoppingListCollection'

import { useApiClient } from '~/composables/api/useApiClient'

type CreateCollectionBody = {
  name: string
  description?: string
  owner: string
}

export function shoppingListCollectionService() {
  const { getCollection, getItem, post } = useApiClient()

  return {
    async getAll(): Promise<ShoppingListCollection[]> {
      const data = await getCollection<ShoppingListCollection>('/api/shopping_list_collections')
      return data.items
    },

    async getById(id: number): Promise<ShoppingListCollection> {
      return getItem<ShoppingListCollection>(`/api/shopping_list_collections/${id}`)
    },

    async create(data: CreateCollectionBody): Promise<ShoppingListCollection> {
      return post<ShoppingListCollection, CreateCollectionBody>(
        '/api/shopping_list_collections',
        data,
      )
    },
  }
}
