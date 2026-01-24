import type { ProductInformation } from '~/types/api/products/productInformation'
import type { User } from '~/types/api/users/user'

import { useApiClient } from '~/composables/api/useApiClient'

type EntityWithIri = { '@id'?: string }

type CacheState<T extends EntityWithIri> = {
  byIri: Record<string, T>
  inflight: Record<string, Promise<T> | undefined>
}

const createState = <T extends EntityWithIri>(): CacheState<T> => ({
  byIri: {},
  inflight: {},
})

const getCached = <T extends EntityWithIri>(state: CacheState<T>, iri: string): T | null => {
  return state.byIri[iri] ?? null
}

const fetchOne = async <T extends EntityWithIri>(
  getItem: <R>(pathOrIri: string) => Promise<R>,
  state: CacheState<T>,
  iri: string,
): Promise<T> => {
  const cached = state.byIri[iri]
  if (cached) return cached

  const inflight = state.inflight[iri]
  if (inflight) return inflight

  const p = getItem<T>(iri).then((entity) => {
    const key = entity['@id'] ?? iri
    state.byIri[key] = entity
    state.inflight[iri] = undefined
    return entity
  })

  state.inflight[iri] = p
  return p
}

const fetchMany = async <T extends EntityWithIri>(
  getItem: <R>(pathOrIri: string) => Promise<R>,
  state: CacheState<T>,
  iris: string[],
): Promise<void> => {
  const unique = [...new Set(iris)].filter((x) => Boolean(x))
  await Promise.all(unique.map((iri) => fetchOne(getItem, state, iri)))
}

export function useIriEntityCache() {
  const { getItem } = useApiClient()

  const users = useState<CacheState<User>>('cache.users', () => createState<User>())
  const products = useState<CacheState<ProductInformation>>('cache.products', () =>
    createState<ProductInformation>(),
  )

  return {
    getUserCached: (iri: string) => getCached(users.value, iri),
    getProductCached: (iri: string) => getCached(products.value, iri),

    fetchUser: (iri: string) => fetchOne(getItem, users.value, iri),
    fetchUsers: (iris: string[]) => fetchMany(getItem, users.value, iris),

    fetchProduct: (iri: string) => fetchOne(getItem, products.value, iri),
    fetchProducts: (iris: string[]) => fetchMany(getItem, products.value, iris),
  }
}
