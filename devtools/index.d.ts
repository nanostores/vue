import type { CreatorLoggerOptions, LoggerOptions } from '@nanostores/logger'
import type { HookPayloads } from '@vue/devtools-api'
import type { AnyStore, MapCreator } from 'nanostores'
import type { App } from 'vue'

interface DevtoolsOptions extends CreatorLoggerOptions, LoggerOptions {
  /**
   * A way to modify creator state before sending it to the devtools inspector.
   *
   * @param payload Vue Devtools hook payload.
   * @param creator Current creator.
   */
  getCreatorInspectorState?: (
    payload: HookPayloads['getInspectorState'],
    creator: MapCreator,
    opts: {
      reduceDataUsage: boolean
    }
  ) => void
}

/**
 * Vue Devtools plugin.
 *
 * Detects stores in the selected component, adds their states to the component
 * inspector. Creates a timeline and an inspector for attached stores.
 *
 * ```js
 * import { devtools } from '@nanostores/vue/devtools'
 * import { $profile } from './stores/index.js'
 *
 * devtools(app, { $profile })
 * ```
 *
 * @param app Vue app.
 * @param stores Stores or creators to attach.
 * @param opts Devtools and logging options.
 */
export function devtools(
  app: App,
  stores?: {
    [key: string]: AnyStore | MapCreator
  },
  opts?: DevtoolsOptions
): void
