import { render, screen } from '@testing-library/vue'
import { atom, map } from 'nanostores'
import { expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

import { mapStores } from './index.js'

it('has mapStores helper', async () => {
  let renders = 0

  let stringAtomStore = atom('0')
  let numberAtomStore = atom(1)
  let letterAtomStore = atom({ letter: 'a' })
  let letterMapStore = map({ letter: 'b' })

  let Component = defineComponent(() => {
    let t = mapStores({
      atom: letterAtomStore,
      map: letterMapStore,
      number: numberAtomStore,
      string: stringAtomStore
    })
    return () => {
      renders += 1
      return h(
        'div',
        { 'data-testid': 'test' },
        `${t.string} ${t.number} ${t.atom.letter} ${t.map.letter}`
      )
    }
  })

  render(Component)
  expect(screen.getByTestId('test').textContent).toBe('0 1 a b')

  stringAtomStore.set('1')
  numberAtomStore.set(2)
  letterAtomStore.set({ letter: 'b' })
  letterMapStore.setKey('letter', 'c')
  await nextTick()
  expect(screen.getByTestId('test').textContent).toBe('1 2 b c')
  expect(renders).toBe(2)
})
