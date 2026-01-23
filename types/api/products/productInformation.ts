import type { BaseEntity, Iri } from '../_shared/common'

export interface ProductInformation extends BaseEntity {
  name: string
  brand: Iri
}
