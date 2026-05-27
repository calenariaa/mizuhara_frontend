import type { ProductInformation } from '@/types/api/products/productInformation'

export const mockProductInformation: ProductInformation[] = [
  {
    '@id': '/api/product_informations/1',
    id: 1,
    code: 'MILK',
    productName: 'Milch',
  },
  {
    '@id': '/api/product_informations/2',
    id: 2,
    code: 'BREAD',
    productName: 'Brot',
  },
  {
    '@id': '/api/product_informations/3',
    id: 3,
    code: 'EGGS',
    productName: 'Eier',
  },
  {
    '@id': '/api/product_informations/4',
    id: 4,
    code: 'BUTTER',
    productName: 'Butter',
  },
]
