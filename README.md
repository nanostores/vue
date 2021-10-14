# Nano Stores Vue

<img align="right" width="92" height="92" title="Nano Stores logo"
     src="https://nanostores.github.io/nanostores/logo.svg">

Vue integration for **[Nano Stores]**, a tiny state manager
with many atomic tree-shakable stores.

* **Small.** Less than 1 KB. Zero dependencies.
* **Fast.** With small atomic and derived stores, you do not need to call
  the selector function for all components on every store change.
* **Tree Shakable.** The chunk contains only stores used by components
  in the chunk.
* Was designed to move logic from components to stores.
* It has good **TypeScript** support.

```vue
<template>
  <header>{{ currentUser.name }}</header>
</template>

<script>
  import { useStore } from '@nanostores/vue'

  import { profile } from '../stores/profile.js'
  import { User } from '../stores/user.js'

  export default {
    setup () {
      const { userId } = useStore(profile).value
      const currentUser = useStore(User(userId))
      return { currentUser }
    }
  }
</script>
```

[Nano Stores]: https://github.com/nanostores/nanostores/
