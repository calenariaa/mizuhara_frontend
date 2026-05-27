import type { ShoppingList } from './shoppingList'
import type { BaseEntity } from '../_shared/common'
import type { User } from '../users/user'

export interface ShoppingListCollection extends BaseEntity {
  name: string
  owner?: User | string | null
  description?: string | null
  shoppingLists?: Array<ShoppingList | string>
}
