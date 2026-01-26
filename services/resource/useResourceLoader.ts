import { ResourceLoader } from './resourceLoader'

import { useApiClient } from '@/composables/api/useApiClient'

export function useResourceLoader(): ResourceLoader {
  const state = useState<ResourceLoader>('resourceLoader', () => {
    const { getItem } = useApiClient()
    return new ResourceLoader(getItem)
  })

  return state.value
}
