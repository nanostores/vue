import type { AnyStore, StoreValue } from 'nanostores'
import type { DeepReadonly, ShallowRef, UnwrapNestedRefs } from 'vue'

/**
 * Combines multiple stores into a single reactive state.
 *
 * ```html
 * <template>
 *   <header>{{ t.header.title }}</header>
 *   <footer>{{ t.footer.copyright }}</footer>
 * </template>
 *
 * <script setup>
 * import { mapStores } from '@nanostores/vue'
 * import { headerMessages, footerMessages } from '../i18n/index.js'
 *
 * const t = mapStores({
 *   header: headerMessages,
 *   footer: footerMessages
 * })
 * </script>
 * ```
 *
 * @param stores Object of stores
 * @returns Reactive state with multiple stores
 */
export function mapStores<StoreList extends { [key: string]: AnyStore }>(
  stores: StoreList
): DeepReadonly<
  UnwrapNestedRefs<{
    [StoreName in keyof StoreList]: ShallowRef<StoreValue<StoreList[StoreName]>>
  }>
>
