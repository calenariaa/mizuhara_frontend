export interface CreateShoppingListCollectionRequest {
  name: string
  description?: string
  owner: string
}

export type UpdateShoppingListCollectionRequest = {
  name?: string
  description?: string | null
  owner?: string
}

export interface CreateShoppingListRequest {
  name: string
  shoppingListCollection?: string
}

export type UpdateShoppingListRequest = {
  name?: string
}

export interface CreateShoppingListEntryRequest {
  shoppingList: string
  productInformation: string
  quantity: number
  addedBy?: string
  acquired?: boolean
}

export type UpdateShoppingListEntryRequest = {
  acquired?: boolean
  quantity?: number
  productInformation?: string
  addedBy?: string
}
