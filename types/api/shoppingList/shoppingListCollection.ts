import type { BaseEntity, Iri } from '../_shared/common'

export interface ShoppingListCollection extends BaseEntity {
  name: string
  shoppingLists?: Iri[]
}
