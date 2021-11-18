import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/vue'
import { defineComponent, h, nextTick } from 'vue'
import { atom, map } from 'nanostores'

import { mapStores } from './index.js'

it('has mapStores helper', async () => {
  let renders = 0

  let stringAtomStore = atom('0')
  let numberAtomStore = atom(1)
  let letterAtomStore = atom({ letter: 'a' })
  let letterMapStore = map({ letter: 'b' })

  let Component = defineComponent(() => {
    let {
      stringAtomStore: s1,
      numberAtomStore: s2,
      letterAtomStore: s3,
      letterMapStore: s4
    } = mapStores({
      stringAtomStore,
      numberAtomStore,
      letterAtomStore,
      letterMapStore
    })
    return () => {
      renders += 1
      return h(
        'div',
        { 'data-testid': 'test' },
        `${s1.value} ${s2.value} ${s3.value.letter} ${s4.value.letter}`
      )
    }
  })

  render(Component)
  expect(screen.getByTestId('test')).toHaveTextContent('0 1 a b')

  stringAtomStore.set('1')
  numberAtomStore.set(2)
  letterAtomStore.set({ letter: 'b' })
  letterMapStore.setKey('letter', 'c')
  await nextTick()
  expect(screen.getByTestId('test')).toHaveTextContent('1 2 b c')
  expect(renders).toBe(2)
})
