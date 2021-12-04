# Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## 0.5.0
* Added `mapStores(stores)` helper that generates object
  with multiple store states via `useStore()`.
* Improved `useVModel(store, keys, opts)` so that you can create multiple models
  with prefix from `opts.prefix`.
* Improve `useStore()` performance.
* Updated dependencies.

## 0.4.1
* Updated dependencies.

## 0.4.0
* Added `useVModel(store, key)` composable to use store in `v-model`.
* Updated dependencies.

## 0.3.0
* Devtools:
  * Added real-time updates of detected states.
  * Added better atom store editor.
  * Added settings update without reloading.
  * Disabled deep state editor.
  * Fixed store type detection.
  * Fixed broken simple state editor.
* Updated dependencies.

## 0.2.1
* Moved devtools to own export.

## 0.2.0
* Added Vue Devtools support.
* Updated dependencies.

## 0.1.0
* Initial release.
