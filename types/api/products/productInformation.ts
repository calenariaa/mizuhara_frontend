import type { JsonLdResource } from '../_shared/common'

export type ProductInformation = JsonLdResource & {
  name: string
  brand?: string
}
