import { HttpResponse } from 'msw'

export const matchApiPath = (path: string): string => `*${path}`

export const jsonCollection = <T>(items: T[]) =>
  HttpResponse.json({
    member: items,
    totalItems: items.length,
  })

export const jsonNotFound = (resourceName: string) =>
  HttpResponse.json({ detail: `${resourceName} not found` }, { status: 404 })

export const nextNumericId = (items: Array<{ id?: number }>): number =>
  Math.max(0, ...items.map((item) => item.id ?? 0)) + 1
