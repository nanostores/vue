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
    ignoreActions: ['Increase Counter'],
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
    ignoreActions: ['Increase Counter'],
    messages: {
      build: false
    }
  }
)
