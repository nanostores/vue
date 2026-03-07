// @vitest-environment node

import { renderToString } from '@vue/server-renderer'
import { atom, onMount } from 'nanostores'
import { expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'

import { useStore } from './index.js'

it('does not leak subscriptions during SSR', async () => {
  let events: string[] = []
  let store = atom('initial')

  onMount(store, () => {
    events.push('mount')
    return () => {
      events.push('unmount')
    }
  })

  for (let i = 0; i < 3; i++) {
    let App = defineComponent({
      setup() {
        let state = useStore(store)
        return () => h('div', state.value)
      }
    })
    let app = createSSRApp(App)
    let html = await renderToString(app)
    expect(html).toBe('<div>initial</div>')
  }

  expect(store.lc).toBe(0)
})

it('renders correct store value during SSR', async () => {
  let store = atom('hello')

  let App = defineComponent({
    setup() {
      let state = useStore(store)
      return () => h('div', state.value)
    }
  })

  let app = createSSRApp(App)
  let html = await renderToString(app)
  expect(html).toBe('<div>hello</div>')
})
