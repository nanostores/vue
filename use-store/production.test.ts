import './set-production.js'

import { render } from '@testing-library/vue'
import { atom } from 'nanostores'
import { expect, it } from 'vitest'
import { defineComponent, isReadonly } from 'vue'

import { useStore } from './index.js'

it('returns writable state in production', () => {
  let store = atom()
  render(
    defineComponent(() => {
      let state = useStore(store)
      expect(isReadonly(state)).toBe(false)
      return () => null
    })
  )
})
