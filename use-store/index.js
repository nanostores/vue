import { getCurrentScope, onScopeDispose, readonly, shallowRef } from 'vue'

import { registerStore } from '../devtools/index.js'

export function useStore(store) {
  let state = shallowRef()

  if (process.env.NODE_ENV !== 'production') {
    if (typeof store === 'function') {
      throw new Error(
        'Use useStore(Template(id)) or useSync() ' +
          'from @logux/client/vue for templates'
      )
    }
  }

  let unsubscribe = store.subscribe(value => {
    state.value = value
  })

  getCurrentScope() && onScopeDispose(unsubscribe)

  if (process.env.NODE_ENV !== 'production') {
    registerStore(store)
    return readonly(state)
  }
  return state
}
