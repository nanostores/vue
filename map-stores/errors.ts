import { atom, deepMap, map } from 'nanostores'

import { mapStores } from './index.js'

let stringAtomStore = atom('0')
let numberAtomStore = atom(0)
let letterAtomStore = atom({ letter: 'a' })
let letterMapStore = map({ letter: 'a' })
let deepMapStore = deepMap({ letters: { a: 1, b: 2 } })

let stores = mapStores({
  deep: deepMapStore,
  letter: letterAtomStore,
  map: letterMapStore,
  number: numberAtomStore,
  string: stringAtomStore
})

// THROWS Property 'value' does not exist
stores.value
// THROWS Cannot assign to 'string' because it is a read-only
stores.string = ''
// THROWS Cannot assign to 'a' because it is a read-only
stores.deep.letters.a = '2'
