import type { ShoppingListEntry } from './shoppingListEntry'
import type { BaseEntity } from '../_shared/common'

export interface ShoppingList extends BaseEntity {
  name: string
  addedBy?: string | null
  shoppingListEntries?: Array<ShoppingListEntry | string>
}
