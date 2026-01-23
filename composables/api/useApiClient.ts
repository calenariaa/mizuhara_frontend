import { useRuntimeConfig } from 'nuxt/app'
import { $fetch, type FetchOptions } from 'ofetch'

import type { HydraCollection } from '~/types/api/_shared/hydra'

type QueryValue = string | number | boolean | null | undefined
type Query = Record<string, QueryValue>

export function useApiClient() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  const apiFetch = <T>(path: string, opts: FetchOptions<'json'> = {}) =>
    $fetch<T>(path, {
      baseURL: apiBase,
      headers: {
        Accept: 'application/ld+json',
        ...(opts.headers ?? {}),
      },
      ...opts,
    })

  const getCollection = <T>(path: string, query?: Query) =>
    apiFetch<HydraCollection<T>>(path, { query })

  const getItem = <T>(pathOrIri: string) => apiFetch<T>(pathOrIri)

  const post = <T, B extends Record<string, unknown>>(path: string, body: B) =>
    apiFetch<T>(path, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/ld+json' },
    })

  const patch = <T, B extends Record<string, unknown>>(pathOrIri: string, body: B) =>
    apiFetch<T>(pathOrIri, {
      method: 'PATCH',
      body,
      headers: { 'Content-Type': 'application/merge-patch+json' },
    })

  const del = (pathOrIri: string) => apiFetch<unknown>(pathOrIri, { method: 'DELETE' })

  return { apiFetch, getCollection, getItem, post, patch, del }
}
