import { getCurrentInstance, onBeforeUnmount, readonly, ref } from 'vue'

export function useStore(store) {
  let state = ref()

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

  getCurrentInstance() && onBeforeUnmount(unsubscribe)

  if (process.env.NODE_ENV !== 'production') {
    let instance = getCurrentInstance()
    if (instance && instance.proxy) {
      let vm = instance.proxy
      let cache = '_nanostores' in vm ? vm._nanostores : (vm._nanostores = [])
      cache.push(store)
    }
    return readonly(state)
  }
  return state
}
