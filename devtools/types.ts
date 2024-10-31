import { atom } from 'nanostores'
import { createApp } from 'vue'

import { devtools } from './index.js'

let app = createApp({})
let $atom = atom()

devtools(
  app,
  { $atom },
  {
    getCreatorInspectorState: () => {},
    messages: {
      build: false
    }
  }
)

app.use(
  devtools,
  { $atom },
  {
    getCreatorInspectorState: () => {},
    messages: {
      build: false
    }
  }
)
