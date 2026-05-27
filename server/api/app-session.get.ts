const appSessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`

export default defineEventHandler(() => ({
  id: appSessionId,
}))
