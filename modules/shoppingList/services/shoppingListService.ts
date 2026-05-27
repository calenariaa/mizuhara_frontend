import type { CreateShoppingListRequest } from '@/modules/shoppingList/types/request'
import type { ShoppingList } from '@/types/api/shoppingList/shoppingList'

import { useApiClient } from '@/composables/api/useApiClient'
import { SHOPPING_LISTS_ENDPOINT } from '@/modules/shoppingList/services/endpoints'

export function shoppingListService() {
  const { getCollection, getItem, post } = useApiClient()

  return {
    async getAll(): Promise<ShoppingList[]> {
      const collectionResult = await getCollection<ShoppingList>(SHOPPING_LISTS_ENDPOINT)
      return collectionResult.items
    },

    async getById(id: number): Promise<ShoppingList> {
      return getItem<ShoppingList>(`${SHOPPING_LISTS_ENDPOINT}/${id}`)
    },

    async create(shoppingListRequest: CreateShoppingListRequest): Promise<ShoppingList> {
      return post<ShoppingList, CreateShoppingListRequest>(
        SHOPPING_LISTS_ENDPOINT,
        shoppingListRequest,
      )
    },
  }
}
