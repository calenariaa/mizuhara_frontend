import type { BaseEntity, Iri } from '../_shared/common'

export interface ShoppingList extends BaseEntity {
  name: string
  shoppingListCollection?: Iri | null
  addedBy?: Iri | null
  shoppingListEntries?: Iri[]
}
