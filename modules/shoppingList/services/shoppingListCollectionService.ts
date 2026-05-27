import type { CreateShoppingListCollectionRequest } from '@/modules/shoppingList/types/request'
import type { ShoppingListCollection } from '@/types/api/shoppingList/shoppingListCollection'

import { useApiClient } from '@/composables/api/useApiClient'
import { SHOPPING_LIST_COLLECTIONS_ENDPOINT } from '@/modules/shoppingList/services/endpoints'

export function shoppingListCollectionService() {
  const { getCollection, getItem, post } = useApiClient()

  return {
    async getAll(): Promise<ShoppingListCollection[]> {
      const collectionResult = await getCollection<ShoppingListCollection>(
        SHOPPING_LIST_COLLECTIONS_ENDPOINT,
      )
      return collectionResult.items
    },

    async getById(id: number): Promise<ShoppingListCollection> {
      return getItem<ShoppingListCollection>(`${SHOPPING_LIST_COLLECTIONS_ENDPOINT}/${id}`)
    },

    async create(
      collectionRequest: CreateShoppingListCollectionRequest,
    ): Promise<ShoppingListCollection> {
      return post<ShoppingListCollection, CreateShoppingListCollectionRequest>(
        SHOPPING_LIST_COLLECTIONS_ENDPOINT,
        collectionRequest,
      )
    },
  }
}
