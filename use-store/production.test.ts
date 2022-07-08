import { defineComponent, isReadonly } from 'vue'
import { expect, test } from 'vitest'
import { render } from '@testing-library/vue'
import { atom } from 'nanostores'

import './set-production.js'
import { useStore } from './index.js'

test('returns writable state in production', () => {
  let store = atom()
  render(
    defineComponent(() => {
      let state = useStore(store)
      expect(isReadonly(state)).toBe(false)
      return () => null
    })
  )
})
