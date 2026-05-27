export const CLIENT_STORAGE_KEYS = {
  colorMode: 'mizuhara.colorMode',
  homeIntroHidden: 'mizuhara.homeIntroHidden',
  serverSessionId: 'mizuhara.serverSessionId',
} as const

export const RESET_ON_SERVER_RESTART_STORAGE_KEYS = [
  CLIENT_STORAGE_KEYS.colorMode,
  CLIENT_STORAGE_KEYS.homeIntroHidden,
] as const
