import type { ProductInformation } from '~/types/api/products/productInformation'
import type { ShoppingList } from '~/types/api/shoppingList/shoppingList'
import type { ShoppingListCollection } from '~/types/api/shoppingList/shoppingListCollection'
import type { ShoppingListEntry } from '~/types/api/shoppingList/shoppingListEntry'
import type { User } from '~/types/api/users/user'

import { useApiClient } from '~/composables/api/useApiClient'

type CreateCollectionBody = {
  name: string
  description?: string
  owner: string
}

type CreateShoppingListBody = {
  name: string
  shoppingListCollection?: string
  addedBy?: string
}

type CreateShoppingListEntryBody = {
  shoppingList: string
  productInformation: string
  addedBy?: string
}

export function shoppingListService() {
  const { getCollection, getItem, post } = useApiClient()

  return {
    async getCollections(): Promise<ShoppingListCollection[]> {
      const data = await getCollection<ShoppingListCollection>('/api/shopping_list_collections')
      return data.items
    },

    async getCollection(id: number): Promise<ShoppingListCollection> {
      return getItem<ShoppingListCollection>(`/api/shopping_list_collections/${id}`)
    },

    async getShoppingLists(): Promise<ShoppingList[]> {
      const data = await getCollection<ShoppingList>('/api/shopping_lists')
      return data.items
    },

    async getShoppingList(id: number): Promise<ShoppingList> {
      return getItem<ShoppingList>(`/api/shopping_lists/${id}`)
    },

    async createCollection(data: CreateCollectionBody): Promise<ShoppingListCollection> {
      return post<ShoppingListCollection, CreateCollectionBody>(
        '/api/shopping_list_collections',
        data,
      )
    },

    async createShoppingList(data: CreateShoppingListBody): Promise<ShoppingList> {
      return post<ShoppingList, CreateShoppingListBody>('/api/shopping_lists', data)
    },

    async createShoppingListEntry(data: CreateShoppingListEntryBody): Promise<ShoppingListEntry> {
      return post<ShoppingListEntry, CreateShoppingListEntryBody>(
        '/api/shopping_list_entries',
        data,
      )
    },

    async getProducts(): Promise<ProductInformation[]> {
      const data = await getCollection<ProductInformation>('/api/product_informations')
      return data.items
    },

    async getUsers(): Promise<User[]> {
      const data = await getCollection<User>('/api/users')
      return data.items
    },
  }
}
