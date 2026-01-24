import type { ShoppingListEntry } from '~/types/api/shoppingList/shoppingListEntry'

import { useApiClient } from '~/composables/api/useApiClient'

type CreateShoppingListEntryBody = {
  shoppingList: string
  productInformation: string
  addedBy?: string
}

export function shoppingListEntryService() {
  const { post, del } = useApiClient()

  return {
    async create(data: CreateShoppingListEntryBody): Promise<ShoppingListEntry> {
      return post<ShoppingListEntry, CreateShoppingListEntryBody>(
        '/api/shopping_list_entries',
        data,
      )
    },

    async deleteByIri(iri: string): Promise<void> {
      await del(iri)
    },
  }
}
