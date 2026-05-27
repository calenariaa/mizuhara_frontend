import type {
  CreateShoppingListCollectionRequest,
  UpdateShoppingListCollectionRequest,
} from '@/modules/shoppingList/types/request'
import type { ShoppingListCollection } from '@/types/api/shoppingList/shoppingListCollection'

import { useApiClient } from '@/composables/api/useApiClient'
import { SHOPPING_LIST_COLLECTIONS_ENDPOINT } from '@/modules/shoppingList/services/endpoints'

export function shoppingListCollectionService() {
  const { del, getCollection, getItem, patch, post } = useApiClient()

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

    async update(
      id: number,
      collectionRequest: UpdateShoppingListCollectionRequest,
    ): Promise<ShoppingListCollection> {
      return patch<ShoppingListCollection, UpdateShoppingListCollectionRequest>(
        `${SHOPPING_LIST_COLLECTIONS_ENDPOINT}/${id}`,
        collectionRequest,
      )
    },

    async remove(id: number): Promise<void> {
      await del(`${SHOPPING_LIST_COLLECTIONS_ENDPOINT}/${id}`)
    },
  }
}
