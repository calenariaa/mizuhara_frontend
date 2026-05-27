import { useRuntimeConfig } from 'nuxt/app'
import { $fetch, type FetchOptions } from 'ofetch'

import type { CollectionResult, JsonLdCollection } from '@/types/api/_shared/collection'

type QueryValue = string | number | boolean | null | undefined
type Query = Record<string, QueryValue>

const toCollectionResult = <T>(data: JsonLdCollection<T>): CollectionResult<T> => {
  const items = data.member ?? data['hydra:member'] ?? []
  const totalItems = data.totalItems ?? data['hydra:totalItems'] ?? items.length
  return { items, totalItems }
}

export function useApiClient() {
  const config = useRuntimeConfig()
  const apiBase = String(config.public.apiBase)

  const apiFetch = <T>(path: string, opts: FetchOptions<'json'> = {}): Promise<T> => {
    const { headers, ...rest } = opts

    return $fetch<T>(path, {
      baseURL: apiBase,
      ...rest,
      headers: {
        Accept: 'application/ld+json',
        ...(headers ?? {}),
      },
    })
  }

  const getCollection = async <T>(path: string, query?: Query): Promise<CollectionResult<T>> => {
    const data = await apiFetch<JsonLdCollection<T>>(path, { query })
    return toCollectionResult(data)
  }

  const getItem = <T>(pathOrIri: string): Promise<T> => apiFetch<T>(pathOrIri)

  const post = <T, B extends object>(path: string, body: B): Promise<T> =>
    apiFetch<T>(path, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/ld+json' },
    })

  const patch = <T, B extends object>(pathOrIri: string, body: B): Promise<T> =>
    apiFetch<T>(pathOrIri, {
      method: 'PATCH',
      body,
      headers: { 'Content-Type': 'application/merge-patch+json' },
    })

  const put = <T, B extends object>(pathOrIri: string, body: B): Promise<T> =>
    apiFetch<T>(pathOrIri, {
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/ld+json' },
    })

  const del = (pathOrIri: string): Promise<unknown> =>
    apiFetch<unknown>(pathOrIri, { method: 'DELETE' })

  return { apiFetch, getCollection, getItem, post, patch, put, del }
}
