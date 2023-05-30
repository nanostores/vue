import type { Store, StoreValue } from 'nanostores'
import type { DeepReadonly, Ref } from 'vue'

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
 *
 * import { router } from './router'
 *
 * export default {
 *   setup () {
 *     let page = useStore(router)
 *     return { page }
 *   }
 * }
 * </script>
 * ```
 *
 * @param store Store instance
 * @returns Store value
 */
export function useStore<
  SomeStore extends Store,
  Value extends StoreValue<SomeStore>
>(store: SomeStore): DeepReadonly<Ref<Value>>

/**
 * Registers the store for the devtools component inspector.
 *
 * @param store Store instance
 * @private
 */
export function registerStore(store: AnyStore): void
