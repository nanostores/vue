import { atom, map } from 'nanostores'

import { useVModel } from './index.js'

type State = { letter: string }

let atomStore = atom<State>({ letter: 'a' })
let atomState = useVModel(atomStore)
let atomKeyState = useVModel(atomStore, 'letter')

// THROWS does not exist
atomState.value.number = 'b'
// THROWS not assignable to type 'string'
atomKeyState.value = 1

let mapStore = map<State>({ letter: 'a' })
let mapModel = useVModel(mapStore)
let mapKeyState = useVModel(mapStore, 'letter')

// THROWS does not exist
mapModel.value.number = 'b'
// THROWS not assignable to type 'string'
mapKeyState.value = 1
