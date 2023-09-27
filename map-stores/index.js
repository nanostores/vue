import { reactive, readonly } from 'vue'

import { useStore } from '../use-store/index.js'

export function mapStores(stores) {
  let storeList = Object.entries(stores).reduce(
    (reduced, [storeName, store]) => {
      reduced[storeName] = useStore(store)
      return reduced
    },
    {}
  )

  if (process.env.NODE_ENV !== 'production') {
    return readonly(storeList)
  }
  return reactive(storeList)
}
