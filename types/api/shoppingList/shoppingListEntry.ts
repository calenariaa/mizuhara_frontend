import type { BaseEntity } from '../_shared/common'
import type { ProductInformation } from '../products/productInformation'
import type { User } from '../users/user'

export interface ShoppingListEntry extends BaseEntity {
  productInformation: ProductInformation | string
  addedBy?: User | string | null
  acquired: boolean
  quantity: number
}
