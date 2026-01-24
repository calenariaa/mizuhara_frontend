import type { BaseEntity, Iri } from '../_shared/common'

export interface ShoppingListEntry extends BaseEntity {
  shoppingList: Iri
  productInformation: Iri
  addedBy?: Iri
  acquired: boolean
}
