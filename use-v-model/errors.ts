import { atom, map } from 'nanostores'

import { useVModel } from './index.js'

let atomStore = atom({ letter: 'a', number: 0 })
let atomState = useVModel(atomStore)
let atomKeyState = useVModel(atomStore, 'letter')

// THROWS does not exist
atomState.value.other = 'b'
// THROWS not assignable to type 'string'
atomKeyState.value = 1

let mapStore = map({ letter: 'a', number: 0 })
let mapModel = useVModel(mapStore)
let mapKeyState = useVModel(mapStore, 'letter')
// THROWS not assignable to parameter
let mapKeysState = useVModel(mapStore, ['letter', 'number'], { test: 'a' })

// THROWS does not exist
mapModel.value.other = 'b'
// THROWS not assignable to type 'string'
mapKeyState.value = 1

// THROWS not assignable to type 'string'
mapKeysState.letter.value = 0
// THROWS does not exist
mapKeysState.other.value
