import type { ProductInformation } from '~/types/api/products/productInformation'

import { useApiClient } from '~/composables/api/useApiClient'

export function productInformationService() {
  const { getCollection } = useApiClient()

  return {
    async getAll(): Promise<ProductInformation[]> {
      const data = await getCollection<ProductInformation>('/api/product_informations')
      return data['hydra:member']
    },
  }
}
