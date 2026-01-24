export type Iri = string

export interface BaseEntity {
  id: number
  createdAt?: string
  updatedAt?: string
}

export type JsonLdResource = {
  '@id': string
  '@type'?: string
}
