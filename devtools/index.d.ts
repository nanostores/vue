import type { AnySyncTemplate, MapTemplate, Store } from 'nanostores'
import type { App } from 'vue'

type AnyStore = AnySyncTemplate | MapTemplate | Store

/**
 * Vue Devtools plugin.
 *
 * It detects nanostores in selected component
 * and add their states to the component inspector.
 *
 * @param app Vue app
 */
export function devtools(app: App): void

/**
 * Attaches stores to devtools’ timeline and inspector.
 *
 * @param app Vue app
 * @param stores Object of stores to attach
 * @param opts Attach options
 */
export function attachStores(
  app: App,
  stores: {
    [key: string]: AnyStore
  }
): void
