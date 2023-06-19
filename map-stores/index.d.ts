import type { AnySyncTemplate, Atom, MapStore, StoreValue } from 'nanostores'
import type { DeepReadonly, Ref } from 'vue'

type AnyStore = AnySyncTemplate | Atom | MapStore

/**
 * Generates object with multiple store states via `useStore()`.
 *
 * ```html
 * <template>
 *   <header>{{ project.name }} / {{ user.name }}</header>
 * </template>
 *
 * <script>
 * import { mapStores } from '@nanostores/vue'
 * import { project } from '../stores/project.js'
 * import { user } from '../stores/user.js'
 *
 * export default {
 *   setup () {
 *     return {
 *       ...mapStores({ project, user })
 *     }
 *   }
 * }
 * </script>
 * ```
 *
 * @param stores Object of stores
 * @returns Multiple store states
 */
export function mapStores<Stores extends { [key: string]: AnyStore }>(
  stores: Stores
): {
  [Property in keyof Stores]: DeepReadonly<Ref<StoreValue<Stores[Property]>>>
}
