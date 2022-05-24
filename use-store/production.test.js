import { defineComponent, isReadonly } from 'vue'
import { expect, test } from 'vitest'
import { render } from '@testing-library/vue'
import { atom } from 'nanostores'

import '../test/set-production.js'
import { useStore } from './index.js'

test('does not return readonly state in production mode', () => {
  let store = atom(() => {})
  render(
    defineComponent(() => {
      let state = useStore(store, 'ID')
      expect(isReadonly(state)).toBe(false)
      return () => null
    })
  )
})
