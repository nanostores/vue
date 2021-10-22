import { AnySyncTemplate, Atom, MapStore } from 'nanostores'
import { App } from 'vue'

export function devtools(app: App): void

type AnyStore = Atom | MapStore | AnySyncTemplate

export interface StoreNameGetter {
  (store: AnyStore, storeName: string): string
}

export function attachStores(
  app: App,
  stores: {
    [key: string]: AnyStore
  },
  optss: {
    nameGetter?: StoreNameGetter
  }
): void
