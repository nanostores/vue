import { useStore } from '../use-store/index.js'

export function mapStores(stores) {
  return Object.entries(stores).reduce((reduced, [storeName, store]) => {
    reduced[storeName] = useStore(store)
    return reduced
  }, {})
}
