import type { ShoppingList, ShoppingListCollection, ShoppingListEntry } from '@/types/shoppingList'

// Configure your Symfony API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

class ShoppingListService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/ld+json',
        // Add authentication headers here when needed
        // 'Authorization': `Bearer ${token}`
        ...options?.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return response.json()
  }

  // ========== GET Methods ==========

  // Fetch all shopping list collections
  async getCollections(): Promise<ShoppingListCollection[]> {
    const data = await this.fetchApi<{ member: ShoppingListCollection[] }>(
      '/shopping_list_collections'
    )
    return data.member || []
  }

  // Fetch a specific collection with all shopping lists
  async getCollection(id: number): Promise<ShoppingListCollection> {
    return this.fetchApi<ShoppingListCollection>(`/shopping_list_collections/${id}`)
  }

  // Fetch all shopping lists
  async getShoppingLists(): Promise<ShoppingList[]> {
    const data = await this.fetchApi<{ member: ShoppingList[] }>('/shopping_lists')
    return data.member || []
  }

  // Fetch a specific shopping list with entries
  async getShoppingList(id: number): Promise<ShoppingList> {
    return this.fetchApi<ShoppingList>(`/shopping_lists/${id}`)
  }

  // ========== POST Methods ==========

  // Create a new shopping list collection
  async createCollection(data: {
    name: string
    description?: string
    owner: string // IRI like "/api/users/1"
  }): Promise<ShoppingListCollection> {
    return this.fetchApi<ShoppingListCollection>('/shopping_list_collections', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Create a new shopping list
  async createShoppingList(data: {
    name: string
    shoppingListCollection?: string // IRI like "/api/shopping_list_collections/1"
    addedBy?: string // IRI like "/api/users/1"
  }): Promise<ShoppingList> {
    return this.fetchApi<ShoppingList>('/shopping_lists', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // Create a new shopping list entry
  async createShoppingListEntry(data: {
    shoppingList: string // IRI like "/api/shopping_lists/1"
    productInformation: string // IRI like "/api/product_informations/1"
    addedBy?: string // IRI like "/api/users/1"
  }): Promise<ShoppingListEntry> {
    return this.fetchApi<ShoppingListEntry>('/shopping_list_entries', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ========== Helper Methods ==========

  // Get product information list (for selecting products)
  async getProducts(): Promise<any[]> {
    const data = await this.fetchApi<{ member: any[] }>('/product_informations')
    return data.member || []
  }

  // Get users (for selecting who added items)
  async getUsers(): Promise<any[]> {
    const data = await this.fetchApi<{ member: any[] }>('/users')
    return data.member || []
  }
}

export const shoppingListService = new ShoppingListService()