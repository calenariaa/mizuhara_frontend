import type { BaseEntity } from '../_shared/common'
import type { ProductInformation } from '../products/productInformation'

export interface ShoppingListEntry extends BaseEntity {
  productInformation: ProductInformation | string
  addedBy?: string | null
  acquired: boolean
  quantity: number
}
