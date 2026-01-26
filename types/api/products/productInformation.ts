import type { BaseEntity } from '../_shared/common'

export interface ProductInformation extends BaseEntity {
  code?: string | null
  productName?: string | null
}
