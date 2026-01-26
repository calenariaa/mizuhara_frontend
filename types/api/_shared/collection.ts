export type JsonLdCollection<T> = {
  '@context'?: string
  '@id'?: string
  '@type'?: string
  totalItems?: number
  member?: T[]
  'hydra:member'?: T[]
  'hydra:totalItems'?: number
}

export type CollectionResult<T> = {
  items: T[]
  totalItems: number
}
