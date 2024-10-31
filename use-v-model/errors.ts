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
// THROWS 'test' does not exist
let mapKeysState = useVModel(mapStore, ['letter', 'number'], { test: 'a' })
let mapKeysStatePrefixed = useVModel(mapStore, ['letter', 'number'], {
  prefix: 'Test'
})

// THROWS does not exist
mapModel.value.other = 'b'
// THROWS not assignable to type 'string'
mapKeyState.value = 1

// THROWS not assignable to type 'string'
mapKeysState.letterModel.value = 0
// THROWS does not exist
mapKeysState.letter.value
// THROWS does not exist
mapKeysState.otherModel.value

// THROWS does not exist
mapKeysStatePrefixed.letter.value
