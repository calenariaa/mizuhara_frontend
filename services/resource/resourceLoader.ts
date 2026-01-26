export type Iri = string

export class ResourceLoader {
  private readonly cache = new Map<Iri, unknown>()
  private readonly inFlight = new Map<Iri, Promise<unknown>>()

  public constructor(private readonly getItem: <T>(pathOrIri: string) => Promise<T>) {}

  public async getByIri<T>(iri: Iri): Promise<T> {
    const cached = this.cache.get(iri)
    if (cached) return cached as T

    const running = this.inFlight.get(iri)
    if (running) return (await running) as T

    const p = this.getItem<T>(iri)
      .then((data) => {
        this.cache.set(iri, data)
        return data
      })
      .finally(() => {
        this.inFlight.delete(iri)
      })

    this.inFlight.set(iri, p)
    return (await p) as T
  }

  public async getManyByIri<T>(iris: readonly Iri[]): Promise<T[]> {
    const unique = [...new Set(iris)].filter((x) => x.length > 0)
    return await Promise.all(unique.map((iri) => this.getByIri<T>(iri)))
  }
}
