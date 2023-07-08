import { cleanup, render, screen } from '@testing-library/vue'
import { delay } from 'nanodelay'
import { atom, map, onMount, STORE_UNMOUNT_DELAY } from 'nanostores'
import { afterEach, expect, it } from 'vitest'
import type { Component } from 'vue'
import { computed, defineComponent, h, nextTick, ref } from 'vue'

import { useStore } from './index.js'

afterEach(cleanup)

function getCatcher(cb: () => void): [string[], Component] {
  let errors: string[] = []
  let Catcher = defineComponent(() => {
    try {
      cb()
    } catch (e) {
      if (e instanceof Error) errors.push(e.message)
    }
    return () => null
  })
  return [errors, Catcher]
}

it('throws on template instead of store', () => {
  let Test = (): void => {}
  let [errors, Catcher] = getCatcher(() => {
    // @ts-expect-error
    useStore(Test, 'ID')
  })
  render(h(Catcher))
  expect(errors).toEqual([
    'Use useStore(Template(id)) or useSync() ' +
      'from @logux/client/vue for templates'
  ])
})

it('renders simple store', async () => {
  let events: string[] = []
  let renders = 0

  let letterStore = atom<string>('')

  onMount(letterStore, () => {
    events.push('constructor')
    letterStore.set('a')
    return () => {
      events.push('destroy')
    }
  })

  let Test1 = defineComponent(() => {
    let store = useStore(letterStore)
    return () => {
      renders += 1
      return h('div', { 'data-testid': 'test1' }, store.value)
    }
  })

  let Test2 = defineComponent(() => {
    let store = useStore(letterStore)
    return () => h('div', { 'data-testid': 'test2' }, store.value)
  })

  let Wrapper = defineComponent(() => {
    let show = ref(true)
    return () =>
      h('div', [
        h('button', {
          onClick: () => {
            show.value = false
          }
        }),
        show.value && h(Test1),
        show.value && h(Test2)
      ])
  })

  render(Wrapper)
  expect(events).toEqual(['constructor'])
  expect(screen.getByTestId('test1').textContent).toBe('a')
  expect(screen.getByTestId('test2').textContent).toBe('a')
  expect(renders).toBe(1)

  letterStore.set('b')
  letterStore.set('c')
  await nextTick()

  expect(screen.getByTestId('test1').textContent).toBe('c')
  expect(screen.getByTestId('test2').textContent).toBe('c')
  expect(renders).toBe(2)

  screen.getByRole('button').click()
  await nextTick()
  expect(screen.queryByTestId('test')).toBe(null)
  expect(renders).toBe(2)
  await delay(STORE_UNMOUNT_DELAY)

  expect(events).toEqual(['constructor', 'destroy'])
})

it('renders map store', async () => {
  let events: string[] = []
  let renders = 0

  let nameStore = map<{ first: string; last: string }>()

  onMount(nameStore, () => {
    events.push('constructor')
    nameStore.setKey('first', 'Aleister')
    nameStore.setKey('last', 'Crowley')
    return () => {
      events.push('destroy')
    }
  })

  let Wrapper = defineComponent(() => {
    let store = useStore(nameStore)
    return () => {
      renders += 1
      return h(
        'div',
        { 'data-testid': 'test' },
        `${store.value.first} ${store.value.last}`
      )
    }
  })

  render(Wrapper)
  expect(events).toEqual(['constructor'])
  expect(screen.getByTestId('test').textContent).toBe('Aleister Crowley')
  expect(renders).toBe(1)

  nameStore.setKey('first', 'Anton')
  nameStore.setKey('last', 'Lavey')
  await nextTick()

  expect(screen.getByTestId('test').textContent).toBe('Anton Lavey')
  expect(renders).toBe(2)
})

it('does not reload store on component changes', async () => {
  let destroyed = ''
  let simple = atom<string>('')

  onMount(simple, () => {
    simple.set('S')
    return () => {
      destroyed += 'S'
    }
  })

  let TestA = defineComponent(() => {
    let simpleStore = useStore(simple)
    let text = computed(() => `1 ${simpleStore.value}`)
    return () => h('div', { 'data-testid': 'test' }, text.value)
  })

  let TestB = defineComponent(() => {
    let simpleStore = useStore(simple)
    let text = computed(() => `2 ${simpleStore.value}`)
    return () => h('div', { 'data-testid': 'test' }, text.value)
  })

  let Switcher = defineComponent(() => {
    let state = ref('a')
    return () => {
      if (state.value === 'a') {
        return h('div', {}, [
          h('button', {
            onClick: () => {
              state.value = 'b'
            }
          }),
          h(TestA)
        ])
      } else if (state.value === 'b') {
        return h('div', {}, [
          h('button', {
            onClick: () => {
              state.value = 'none'
            }
          }),
          h(TestB)
        ])
      } else {
        return null
      }
    }
  })

  render(Switcher)
  expect(screen.getByTestId('test').textContent).toBe('1 S')

  screen.getByRole('button').click()
  await nextTick()
  expect(screen.getByTestId('test').textContent).toBe('2 S')
  expect(destroyed).toBe('')

  screen.getByRole('button').click()
  await nextTick()
  expect(screen.queryByTestId('test')).toBe(null)
  expect(destroyed).toBe('')

  await delay(STORE_UNMOUNT_DELAY)
  expect(destroyed).toBe('S')
})
