import { atom, map } from 'nanostores'

import { mapStores } from './index.js'

let stringAtomStore = atom('0')
let numberAtomStore = atom(0)
let letterAtomStore = atom({ letter: 'a' })
let letterMapStore = map({ letter: 'a' })
let stores = mapStores({
  stringAtomStore,
  numberAtomStore,
  letterAtomStore,
  letterMapStore
})

// THROWS does not exist
stores.atomStore
// THROWS not assignable to type 'Ref<string>'
stores.stringAtomStore = ''
// THROWS not assignable to type 'string'
stores.stringAtomStore.value = 0
// THROWS not assignable to type 'number'
stores.numberAtomStore.value = 'a'
// THROWS 'letter' is missing
stores.letterAtomStore.value = {}
// THROWS it is a read-only
stores.letterAtomStore.value.letter = 'b'
// THROWS it is a read-only
stores.letterMapStore.value.letter = 'b'
