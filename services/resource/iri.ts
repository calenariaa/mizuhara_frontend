export type HasIri = { '@id'?: string }

export const getIri = (entity: HasIri | null | undefined): string => entity?.['@id'] ?? ''

export const getNumericIdFromIri = (iri: string): number | null => {
  const match = iri.match(/\/(\d+)\/?$/)
  if (!match) return null

  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}
