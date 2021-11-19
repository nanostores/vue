import { computed } from 'vue'

import { useStore } from '../use-store/index.js'

export function useVModel(store, keys, opts = {}) {
  let prefix = opts.prefix || 'Model'
  let state = useStore(store)
  if (Array.isArray(keys)) {
    return keys.reduce((reduced, key) => {
      reduced[`${key}${prefix}`] = computed({
        get: () => state.value[key],
        set: value => {
          store.setKey(key, value)
        }
      })
      return reduced
    }, {})
  } else {
    let key = keys
    return computed({
      get: () => (key ? state.value[key] : state.value),
      set: value => {
        key ? store.setKey(key, value) : store.set(value)
      }
    })
  }
}
