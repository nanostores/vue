import { atom, map } from 'nanostores'

import { useStore } from './index.js'

type State = { letter: string }

let atomStore = atom<State>({ letter: 'a' })
let atomState = useStore(atomStore)

// THROWS Property 'number' does not exist
atomState.value.number = 'b'
// THROWS Cannot assign to 'letter' because it is a read-only
atomState.value.letter = 'b'

let mapStore = map<State>({ letter: 'a' })
let mapState = useStore(mapStore)

// THROWS Property 'number' does not exist
mapState.value.number = 'b'
// THROWS Cannot assign to 'letter' because it is a read-only
mapState.value.letter = 'b'
