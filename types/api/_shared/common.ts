export type Iri = string

export interface BaseEntity {
  '@id'?: string
  id?: number
}

export type JsonLdResource = {
  '@id': Iri
  '@type'?: string
}
