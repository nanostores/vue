import { fireEvent, render, screen } from '@testing-library/vue'
import { atom, map, onMount } from 'nanostores'
import { expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import { useVModel } from './index.js'

it('renders simple store', async () => {
  let store = atom('')

  onMount(store, () => {
    store.set('Kazimir Malevich')
  })

  let Component = defineComponent({
    setup: () => ({
      state: useVModel(store)
    }),
    template: '<input v-model="state" data-testid="test"/>'
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

it('renders map store', async () => {
  let events: string[] = []
  let store = map<{ first: string; last: string; user: string }>()

  onMount(store, () => {
    store.setKey('first', 'Kazimir')
    store.setKey('last', 'Malevich')
    store.setKey('user', 'Suprematist')
  })

  store.listen((value, key) => {
    events.push(value[key])
  })

  let Component = defineComponent({
    setup: () => ({
      ...useVModel(store, ['first', 'last']),
      userModel: useVModel(store, 'user')
    }),
    template: `
      <input v-model="firstModel" data-testid="first"/>
      <input v-model="lastModel" data-testid="last"/>
      <input v-model="userModel" data-testid="user"/>
    `
  })

  render(Component)
  let first = screen.getByTestId<HTMLInputElement>('first')
  let last = screen.getByTestId<HTMLInputElement>('last')
  let user = screen.getByTestId<HTMLInputElement>('user')
  expect(first.value).toBe('Kazimir')
  expect(last.value).toBe('Malevich')
  expect(user.value).toBe('Suprematist')

  await fireEvent.update(first, 'Lazar')
  expect(first.value).toBe('Lazar')

  await fireEvent.update(last, 'Khidekel')
  expect(last.value).toBe('Khidekel')
  expect(store.get()).toEqual({
    first: 'Lazar',
    last: 'Khidekel',
    user: 'Suprematist'
  })

  store.setKey('first', 'Lyubov')
  await nextTick()
  expect(first.value).toBe('Lyubov')

  store.setKey('last', 'Popova')
  await nextTick()
  expect(last.value).toBe('Popova')

  await fireEvent.update(user, 'Cubist')
  expect(user.value).toBe('Cubist')

  expect(events).toEqual(['Lazar', 'Khidekel', 'Lyubov', 'Popova', 'Cubist'])
})
