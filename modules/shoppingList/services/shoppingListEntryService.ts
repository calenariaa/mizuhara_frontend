import type { ShoppingListEntry } from '~/types/api/shoppingList/shoppingListEntry'

import { useApiClient } from '~/composables/api/useApiClient'

type CreateShoppingListEntryBody = {
  shoppingList: string
  productInformation: string
  quantity: number
  addedBy?: string
}

export function shoppingListEntryService() {
  const { getCollection, post, del, patch } = useApiClient()

  return {
    async getByShoppingListId(shoppingListId: number): Promise<ShoppingListEntry[]> {
      const listIri = `/api/shopping_lists/${shoppingListId}`
      const data = await getCollection<ShoppingListEntry>('/api/shopping_list_entries', {
        shoppingList: listIri,
      })
      return data.items
    },

    async create(body: CreateShoppingListEntryBody): Promise<ShoppingListEntry> {
      return post<ShoppingListEntry, CreateShoppingListEntryBody>(
        '/api/shopping_list_entries',
        body,
      )
    },

    async remove(entryIriOrPath: string): Promise<void> {
      await del(entryIriOrPath)
    },

    async setAcquired(entryIriOrPath: string, acquired: boolean): Promise<void> {
      await patch<unknown, { acquired: boolean }>(entryIriOrPath, { acquired })
    },
  }
}
