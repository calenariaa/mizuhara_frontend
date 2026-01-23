export interface BaseEntity {
  id: number
  createdAt?: string
  updatedAt?: string
}

export interface User {
  id: number
  name: string
  email?: string
}

export interface ProductInformation {
  id: number
  name: string
  description?: string
  category?: string
  imageUrl?: string
}

export interface ShoppingListEntry extends BaseEntity {
  shoppingList?: ShoppingList
  productInformation: ProductInformation
  addedBy?: User
  checked?: boolean
}

export interface ShoppingList extends BaseEntity {
  name: string
  shoppingListCollection?: ShoppingListCollection
  addedBy?: User
  shoppingListEntries: ShoppingListEntry[]
}

export interface ShoppingListCollection extends BaseEntity {
  name: string
  owner: User
  description?: string
  shoppingLists: ShoppingList[]
}