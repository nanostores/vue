import { computed } from 'vue'

import { useStore } from '../use-store/index.js'

export function useVModel(store, key) {
  let state = useStore(store)
  return computed({
    get: () => {
      return key ? state.value[key] : state.value
    },
    set: value => {
      key ? store.setKey(key, value) : store.set(value)
    }
  })
}
