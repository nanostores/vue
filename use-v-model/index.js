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
    if (key === undefined) {
      return computed({
        get: () => state.value,
        set: value => store.set(value)
      })
    }
    return computed({
      get: () => state.value[key],
      set: value => store.setKey(key, value)
    })
  }
}
