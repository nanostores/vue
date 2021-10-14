import { atom, map } from 'nanostores'

import { useStore } from '../index.js'

type State = { letter: string }

let atomStore = atom<State>({ letter: 'a' })
let atomState = useStore(atomStore)

// THROWS does not exist
atomState.value.number = 'b'
// THROWS read-only property
atomState.value.letter = 'b'

let mapStore = map<State>({ letter: 'a' })
let mapState = useStore(mapStore)

// THROWS does not exist
mapState.value.number = 'b'
// THROWS read-only property
mapState.value.letter = 'b'
