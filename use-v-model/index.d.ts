import { Store, StoreValue } from 'nanostores'
import { Ref } from 'vue'

/**
 * Creates writable computed for usage in `v-model`.
 *
 * @param store Store instance.
 * @param key Store’s key.
 */
export function useVModel<
  SomeStore extends Store,
  Value extends StoreValue<SomeStore>,
  Key extends keyof Value = undefined
>(
  store: SomeStore,
  key?: Key
): Key extends undefined ? Ref<Value> : Ref<Value[Key]>
