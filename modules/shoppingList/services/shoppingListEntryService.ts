import type {
  CreateShoppingListEntryRequest,
  UpdateShoppingListEntryRequest,
} from '@/modules/shoppingList/types/request'
import type { ShoppingListEntry } from '@/types/api/shoppingList/shoppingListEntry'

import { useApiClient } from '@/composables/api/useApiClient'
import { SHOPPING_LIST_ENTRIES_ENDPOINT } from '@/modules/shoppingList/services/endpoints'

export function shoppingListEntryService() {
  const { post, del, patch } = useApiClient()

  return {
    async create(body: CreateShoppingListEntryRequest): Promise<ShoppingListEntry> {
      return post<ShoppingListEntry, CreateShoppingListEntryRequest>(
        SHOPPING_LIST_ENTRIES_ENDPOINT,
        body,
      )
    },

    async remove(entryIriOrPath: string): Promise<void> {
      await del(entryIriOrPath)
    },

    async setAcquired(entryIriOrPath: string, acquired: boolean): Promise<void> {
      const body: UpdateShoppingListEntryRequest = { acquired }
      await patch<unknown, UpdateShoppingListEntryRequest>(entryIriOrPath, body)
    },

    async update(entryIriOrPath: string, body: UpdateShoppingListEntryRequest): Promise<void> {
      await patch<unknown, UpdateShoppingListEntryRequest>(entryIriOrPath, body)
    },
  }
}
