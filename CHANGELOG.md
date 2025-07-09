# Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## 1.0.1
* Fixed broken devtools (by @oguzhanmemis7849).
* Updated dependencies.

## 1.0.0
* Moved to Nano Stores 1.0.
* Improved `useVModel()` performance (by @wsafight).
* Removed Node.js 18 support.
* Updated dependencies.

## 0.11.0
* Moved to Nano Stores 0.11.
* Added support for Vue Devtools 7 (next).
* Changed return value of `mapStores()` to `reactive`.
* Updated dependencies.
* Improved types.

## 0.10.0
* Refactored devtools part:
  * Added better logging and tagging.
  * Removed `attachStores` method.
  * Extended `devtools` method.
* Dropped Node.js 16 support.
* Updated dependencies.

## 0.9.1
* Fixed broken devtools: removed support for `mapTemplate`.
* Updated dependencies.

## 0.9.0
* Moved to Nano Stores 0.9.

## 0.8.2
* Fixed broken export for `registerStore`.

## 0.8.1
* Fixed broken export for `registerStore`.

## 0.8.0
* Moved to Nano Stores 0.8.
* Dropped Node.js 14 support.
* Exported `registerStore` private method for devtools.
* Updated dependencies.

## 0.7.0
* Moved to Nano Stores 0.7.

## 0.6.0
* Moved to Nano Stores 0.6.
* Migrated test to Vitest with improved coverage.
* Dropped Node.js 12 support.
* Updated dependencies.

## 0.5.5
* Updated dependencies.

## 0.5.4
* Updated dependencies.

## 0.5.3
* Improved `useStore()` effect disposing.
* Migrated to pnpm.

## 0.5.2
* Fixed `attachStores()` types.
* Updated dependencies.

## 0.5.1
* Fixed missing types for prefix in `useVModel()`.

## 0.5.0
* Added `mapStores(stores)` helper that generates object.
  with multiple store states via `useStore()`.
* Improved `useVModel(store, keys, opts)` so that you can create multiple models.
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
