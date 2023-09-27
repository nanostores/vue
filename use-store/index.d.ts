import type { AnyStore, Store, StoreValue } from 'nanostores'
import type { DeepReadonly, ShallowRef, UnwrapNestedRefs } from 'vue'

/**
 * Subscribes to store changes and gets store’s value.
 *
 * ```html
 * <template>
 *   <home-view v-if="page.router === 'home'" />
 *   <error-404-view v-else />
 * </template>
 *
 * <script>
 * import { useStore } from '@nanostores/vue'
 * import { $router } from './router/index.js'
 *
 * const page = useStore($router)
 * </script>
 * ```
 *
 * @param store Store instance
 * @returns Reactive store value
 */
export function useStore<
  SomeStore extends Store,
  Value extends StoreValue<SomeStore>
>(store: SomeStore): DeepReadonly<UnwrapNestedRefs<ShallowRef<Value>>>

/**
 * Registers the store for the devtools component inspector.
 *
 * @param store Store instance
 * @private
 */
export function registerStore(store: AnyStore): void
