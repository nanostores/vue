# Nano Stores Vue

<img align="right" width="92" height="92" title="Nano Stores logo"
     src="https://nanostores.github.io/nanostores/logo.svg">

Vue integration for **[Nano Stores]**, a tiny state manager
with many atomic tree-shakable stores.

* **Small.** Less than 1 KB with all helpers. Zero dependencies.
* **Fast.** With small atomic and derived stores, you do not need to call
  the selector function for all components on every store change.
* **Tree Shakable.** The chunk contains only stores used by components
  in the chunk.
* **Helpers.** Designed to keep code clean and save a few keystrokes.
* **Devtools.** Plugin with full support of [Vue Devtools].
* Was designed to move logic from components to stores.
* It has good **TypeScript** support.


## Install

```sh
npm install @nanostores/vue
```


## Usage

### Store state

Subscribe to store changes and use reactive store state.

```vue
<template>
  <header>{{ profile.name }}</header>
</template>

<script setup>
  import { useStore } from '@nanostores/vue'
  import { $profile } from '../stores/index.js'

  const profile = useStore($profile)
</script>
```

### Multiple store states

Generate multiple store states and save a few keystrokes.

```vue
<template>
  <header>{{ project.name }} / {{ user.name }}</header>
</template>

<script setup>
  import { mapStores } from '@nanostores/vue'
  import { $project, $user } from '../stores/index.js'

  const { project, user } = mapStores({
    project: $project,
    user: $user
  })
</script>
```

### Form handling

Since the store state is deep read-only, you cannot directly mutate it.
But for `v-model` you can create model via `useVModel(store, keys, opts)`.
It will explicitly mutate the store via `store.set()` / `store.setKey()`.

```vue
<template>
  <input v-model="username"/>
</template>

<script setup>
  import { useVModel } from '@nanostores/vue'
  import { $profile } from '../stores/index.js'

  const username = useVModel($profile, 'username')
</script>
```

The `keys` argument can be an array of keys to create multiple models.
Each model will be prefixed with `Model`. You can change it via `opts.prefix`.

```vue
<template>
  <input v-model="firstNameModel"/>
  <input v-model="lastNameModel"/>
</template>

<script setup>
  import { useVModel } from '@nanostores/vue'
  import { $profile } from '../stores/index.js'

  const {
    firstNameModel,
    lastNameModel
  } = useVModel($profile, ['firstName', 'lastName'])
</script>
```


## Devtools

<p align="center">
  <img src="img/screenshot.jpg" alt="Nanostores Vue Devtools" width="830">
</p>


### Install

```sh
npm install --save-dev @vue/devtools-api @nanostores/logger
```


### Usage

#### Store detector

Install **[Vue Devtools]** plugin as usual. It will detect nanostores
in selected component and add their states to the **component inspector**.

```js
import { createApp } from 'vue'
import { devtools } from '@nanostores/vue/devtools'

const app = createApp(…)

app.use(devtools)
```

> Notice: if you are using SSR, there is no Vue Devtools on server.
> Check it’s a browser environment:
> ```js
> if (window) app.use(devtools)
> ```

Attach stores to add them to the **nanostores inspector**
and see their builds, lifecycles and changes on the **timeline**.

```js
import { createApp } from 'vue'
import { devtools } from '@nanostores/vue/devtools'

import { $user } from '../stores/index.js'

const app = createApp(…)

app.use(devtools, { User: $user })
```


### Plugin Settings

#### Real-time update detection

Real-time update of the states of all detected stores
in the **component inspector**.

#### Keep unmounted

Keeps all unmounted stores in **Nanostores inspector** tab.

#### Reduce data usage

In some places hides the full store snapshot to reduce data usage
and speed up devtools.

[Nano Stores]: https://github.com/nanostores/nanostores/
[Vue Devtools]: https://devtools.vuejs.org
