import type { ShoppingListEntry } from './shoppingListEntry'
import type { BaseEntity } from '../_shared/common'
import type { User } from '../users/user'

export interface ShoppingList extends BaseEntity {
  name: string
  addedBy?: User | string | null
  shoppingListEntries?: Array<ShoppingListEntry | string>
}
