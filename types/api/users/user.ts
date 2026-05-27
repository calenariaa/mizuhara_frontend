import type { BaseEntity } from '../_shared/common'
import type { ShoppingList } from '../shoppingList/shoppingList'
import type { ShoppingListEntry } from '../shoppingList/shoppingListEntry'

export interface User extends BaseEntity {
  email: string
  username: string
  isActive?: boolean
  active?: boolean
  shoppingLists?: Array<ShoppingList | string>
  shoppingListEntries?: Array<ShoppingListEntry | string>
  genericTasks?: string[]
  createdAt?: string
  updatedAt?: string
}
