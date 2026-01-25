import type { ShoppingList } from './shoppingList'
import type { BaseEntity } from '../_shared/common'

export interface ShoppingListCollection extends BaseEntity {
  name: string
  description?: string | null
  shoppingLists?: Array<ShoppingList | string>
}
