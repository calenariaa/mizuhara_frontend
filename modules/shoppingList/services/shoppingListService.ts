import type { ShoppingList } from '~/types/api/shoppingList/shoppingList'

import { useApiClient } from '~/composables/api/useApiClient'

type CreateShoppingListBody = {
  name: string
  shoppingListCollection?: string
  addedBy?: string
}

export function shoppingListService() {
  const { getCollection, getItem, post } = useApiClient()

  return {
    async getAll(): Promise<ShoppingList[]> {
      const data = await getCollection<ShoppingList>('/api/shopping_lists')
      return data['hydra:member']
    },

    async getById(id: number): Promise<ShoppingList> {
      return getItem<ShoppingList>(`/api/shopping_lists/${id}`)
    },

    async create(data: CreateShoppingListBody): Promise<ShoppingList> {
      return post<ShoppingList, CreateShoppingListBody>('/api/shopping_lists', data)
    },
  }
}
