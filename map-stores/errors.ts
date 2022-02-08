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
// THROWS not assignable to type 'Readonly<Ref<string>>'
stores.stringAtomStore = ''
