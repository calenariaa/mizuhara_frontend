import type { BaseEntity, Iri } from '../_shared/common'

export interface ShoppingListEntry extends BaseEntity {
  shoppingList: Iri
  productName: Iri
  addedBy?: Iri
  acquired: boolean
  quantity: number
}
