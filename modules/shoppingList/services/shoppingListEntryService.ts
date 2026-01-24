import type { ShoppingListEntry } from '~/types/api/shoppingList/shoppingListEntry'

import { useApiClient } from '~/composables/api/useApiClient'

export function shoppingListEntryService() {
  const { getCollection } = useApiClient()

  return {
    async getByShoppingListId(shoppingListId: number): Promise<ShoppingListEntry[]> {
      const listIri = `/api/shopping_lists/${shoppingListId}`
      const data = await getCollection<ShoppingListEntry>('/api/shopping_list_entries', {
        shoppingList: listIri,
      })
      return data.items
    },
  }
}
