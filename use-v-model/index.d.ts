import { Store, StoreValue } from 'nanostores'
import { Ref } from 'vue'

/**
 * Creates a writable state for use in `v-model`.
 *
 * ```vue
 * <template>
 *   <input v-model="username"/>
 * </template>
 *
 * <script>
 *   import { useVModel } from '@nanostores/vue'
 *
 *   import { profile } from '../stores/profile.js'
 *
 *   export default {
 *     setup () {
 *       const username = useVModel(profile, 'username')
 *       return { username }
 *     }
 *   }
 * </script>
 * ```
 *
 * @param store Store instance.
 * @param key Store’s key.
 * @returns Writable store value
 */
export function useVModel<
  SomeStore extends Store,
  Value extends StoreValue<SomeStore>,
  Key extends keyof Value = undefined
>(
  store: SomeStore,
  key?: Key
): Key extends undefined ? Ref<Value> : Ref<Value[Key]>
