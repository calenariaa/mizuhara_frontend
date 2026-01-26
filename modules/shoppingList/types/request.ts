export interface CreateShoppingListCollectionRequest {
  name: string
  description?: string
  owner: string
}

export interface CreateShoppingListRequest {
  name: string
  shoppingListCollection?: string
  addedBy?: string
}

export interface CreateShoppingListEntryRequest {
  shoppingList: string
  productInformation: string
  quantity: number
  addedBy?: string
  acquired?: boolean
}

export interface UpdateShoppingListEntryRequest {
  acquired: boolean
}
