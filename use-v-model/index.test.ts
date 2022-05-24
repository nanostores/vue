import { fireEvent, render, screen } from '@testing-library/vue'
import { defineComponent, nextTick } from 'vue'
import { atom, map, onMount } from 'nanostores'

import { useVModel } from './index.js'

test('renders simple store', async () => {
  let store = atom('')

  onMount(store, () => {
    store.set('Kazimir Malevich')
  })

  let Component = defineComponent({
    template: '<input v-model="state" data-testid="test"/>',
    setup: () => ({
      state: useVModel(store)
    })
  })

  render(Component)
  let input = screen.getByTestId<HTMLInputElement>('test')
  expect(input.value).toBe('Kazimir Malevich')

  await fireEvent.update(input, 'Lazar Khidekel')
  expect(input.value).toBe('Lazar Khidekel')
  expect(store.get()).toBe('Lazar Khidekel')

  store.set('Lyubov Popova')
  await nextTick()
  expect(input.value).toBe('Lyubov Popova')
})

test('renders map store', async () => {
  let events: string[] = []
  let store = map<{ first: string; last: string }>()

  onMount(store, () => {
    store.setKey('first', 'Kazimir')
    store.setKey('last', 'Malevich')
  })

  store.listen((value, key) => {
    events.push(value[key])
  })

  let Component = defineComponent({
    template: `
      <input v-model="firstModel" data-testid="first"/>
      <input v-model="lastModel" data-testid="last"/>
    `,
    setup: () => ({
      ...useVModel(store, ['first', 'last'])
    })
  })

  render(Component)
  let first = screen.getByTestId<HTMLInputElement>('first')
  let last = screen.getByTestId<HTMLInputElement>('last')
  expect(first.value).toBe('Kazimir')
  expect(last.value).toBe('Malevich')

  await fireEvent.update(first, 'Lazar')
  expect(first.value).toBe('Lazar')

  await fireEvent.update(last, 'Khidekel')
  expect(last.value).toBe('Khidekel')
  expect(store.get()).toEqual({ first: 'Lazar', last: 'Khidekel' })

  store.setKey('first', 'Lyubov')
  await nextTick()
  expect(first.value).toBe('Lyubov')

  store.setKey('last', 'Popova')
  await nextTick()
  expect(last.value).toBe('Popova')

  expect(events).toEqual(['Lazar', 'Khidekel', 'Lyubov', 'Popova'])
})
