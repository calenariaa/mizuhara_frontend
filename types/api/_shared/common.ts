export type Iri = string

export interface BaseEntity {
  '@id'?: Iri
  id: number
  createdAt?: string
  updatedAt?: string
}

export type JsonLdResource = {
  '@id': Iri
  '@type'?: string
}
