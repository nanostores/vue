import {
  getCurrentInstance,
  getCurrentScope,
  onScopeDispose,
  readonly,
  shallowRef
} from 'vue'

export function registerStore(store) {
  let instance = getCurrentInstance()
  if (instance && instance.proxy) {
    let vm = instance.proxy
    let cache = '_nanostores' in vm ? vm._nanostores : (vm._nanostores = [])
    cache.push(store)
  }
}

export function useStore(store) {
  let state = shallowRef()

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
