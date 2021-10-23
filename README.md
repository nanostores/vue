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

## Install

```sh
npm install @nanostores/vue
```

## Usage

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

## DevTools

### Install

```sh
npm install --save-dev @vue/devtools-api
```

### Usage

Install [Vue Devtools] plugin as usual and it will detect nanostores
in selected component and add their states to the **component inspector**.

```js
import { createApp } from 'vue'
import { devtools } from '@nanostores/vue'

import { User } from '../stores/user.js'

const app = createApp(…)
app.use(devtools)
```

Attach nanostores to add them to the **nanostores inspector**
and see their lifecycle on the **timeline**.

```js
import { createApp } from 'vue'
import { devtools, attachStores } from '@nanostores/vue'

import { User } from '../stores/user.js'

const app = createApp(…)
app.use(devtools)

attachStores(app, { User })
```

You can connect several stores in different places of your application
and set them custom names to simplify the work with **nanostores inspector**.

```js
attachStores(app, {
  'Current User': User,
  Post
})
```

When working with MapTemplate, this may not be enough. You can create
a custom `nameGetter` to set suitable names for each store
built from MapTemplate.

```js
attachStores(app, { User }, {
  nameGetter: (store, storeName) => {
    return 'build' in store ? storeName : store.get().firstName || storeName
  }
})
```

[Nano Stores]: https://github.com/nanostores/nanostores/
[Vue Devtools]: https://devtools.vuejs.org
