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
  <header>{{ post.title }} for {{ user.name }}</header>
</template>

<script>
  import { useStore } from '@nanostores/vue'

  import { profile } from '../stores/profile.js'
  import { Post } from '../stores/post.js'

  export default {
    setup (props) {
      const user = useStore(profile)
      const post = useStore(Post(props.postId))
      return { user, post }
    }
  }
</script>
```

### Form handling

Since the store state is deep read-only, you cannot directly mutate it.
But for `v-model` you can use `useVModel(store, key)`. It will
explicitly mutate the store via `store.set()` / `store.setKey()`.

```vue
<template>
  <input v-model="username"/>
</template>

<script>
  import { useVModel } from '@nanostores/vue'

  import { profile } from '../stores/profile.js'

  export default {
    setup () {
      const username = useVModel(profile, 'username')
      return { username }
    }
  }
</script>
```

## Devtools

### Install

```sh
npm install --save-dev @vue/devtools-api
```

### Usage

Install **[Vue Devtools]** plugin as usual. It will detect nanostores
in selected component and add their states to the **component inspector**.

```js
import { createApp } from 'vue'
import { devtools } from '@nanostores/vue/devtools'

import { User } from '../stores/user.js'

const app = createApp(…)
app.use(devtools)
```

> Notice: if you are using SSR, there is no Vue Devtools on server. Check it’s a browser environment: `if (window) app.use(devtools)`

Attach stores to add them to the **nanostores inspector**
and see their builds, lifecycles and changes on the **timeline**.

```js
import { createApp } from 'vue'
import { devtools, attachStores } from '@nanostores/vue/devtools'

import { User } from '../stores/user.js'

const app = createApp(…)
app.use(devtools)

attachStores(app, { User })
```

You can connect several stores in different places of your application
and set custom names to simplify the work with devtools.

```js
attachStores(app, {
  'Current User': User,
  Post
})
```

For `MapTemplate` you can create a custom `nameGetter`
to set suitable names for each store built from template.

```js
attachStores(app, { User }, {
  nameGetter: (store, templateName) => {
    return `User:${store.get().id}`
  }
})
```

### Settings

By default, we removes unmounted stores from **nanostores inspector**
to keep it clean. You can change this in the plugin settings
via the **Keep unmounted** property.

[Nano Stores]: https://github.com/nanostores/nanostores/
[Vue Devtools]: https://devtools.vuejs.org
