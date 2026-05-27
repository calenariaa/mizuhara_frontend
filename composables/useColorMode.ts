import { CLIENT_STORAGE_KEYS } from '@/config/clientStorage'

export type ColorMode = 'light' | 'dark'

const DEFAULT_COLOR_MODE: ColorMode = 'light'

const isColorMode = (value: string | null): value is ColorMode =>
  value === 'light' || value === 'dark'

export const useColorMode = () => {
  const colorMode = useState<ColorMode>('colorMode', () => DEFAULT_COLOR_MODE)

  const applyColorMode = (mode: ColorMode): void => {
    colorMode.value = mode
    document.documentElement.dataset.theme = mode
    localStorage.setItem(CLIENT_STORAGE_KEYS.colorMode, mode)
  }

  const loadColorMode = (): void => {
    const storedColorMode = localStorage.getItem(CLIENT_STORAGE_KEYS.colorMode)
    applyColorMode(isColorMode(storedColorMode) ? storedColorMode : DEFAULT_COLOR_MODE)
  }

  const toggleColorMode = (): void => {
    applyColorMode(colorMode.value === 'dark' ? 'light' : 'dark')
  }

  return {
    colorMode,
    loadColorMode,
    toggleColorMode,
  }
}
