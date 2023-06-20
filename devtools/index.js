import { addLogger } from '@nanostores/logger'
import { setupDevtoolsPlugin } from '@vue/devtools-api'
import { onSet } from 'nanostores'

const layerId = 'nanostores'
const inspectorId = 'nanostores'
export const pluginConfig = {
  componentStateTypes: ['Nanostores'],
  enableEarlyProxy: true,
  homepage: 'https://github.com/nanostores',
  id: 'io.github.nanostores',
  label: 'Nanostores',
  logo: 'https://nanostores.github.io/nanostores/logo.svg',
  packageName: '@nanostores/vue',
  settings: {
    realtime: {
      defaultValue: true,
      label: 'Real-time update detection',
      type: 'boolean'
    }
  }
}

let eventGroups = 0
let inspectorTree = []

function getGroupId() {
  return (eventGroups += 1)
}

function pushToInspectorTree(node) {
  inspectorTree.push(node)
}

function find(target, text) {
  return target.some(item => item.toLowerCase().includes(text.toLowerCase()))
}

function isAtom(store) {
  return store.setKey === undefined
}

function notifyComponentUpdate(api, ...args) {
  let last = 0
  let now = Date.now()
  if (now - last > 1000) {
    api.notifyComponentUpdate(...args)
    last = now
  }
}

function isValidPayload(payload, app, id) {
  return (
    payload.app === app &&
    payload.inspectorId === inspectorId &&
    payload.nodeId === id
  )
}

function createLogger(app, api, store, storeName, groupId, nodeId) {
  api.sendInspectorTree(inspectorId)

  let unbindLogger = addLogger(store, {
    set: ({ actionName, changed, newValue, oldValue }) => {
      api.sendInspectorState(inspectorId)
      if (api.getSettings().realtime) {
        notifyComponentUpdate(api)
      }

      let data = {
        action: actionName,
        key: changed,
        newValue,
        oldValue
      }
      if (data.action === undefined) delete data.action
      if (data.key === undefined) delete data.key

      api.addTimelineEvent({
        event: {
          data,
          groupId,
          subtitle: 'was changed',
          time: Date.now(),
          title: storeName
        },
        layerId
      })
    },

    start: () => {
      api.addTimelineEvent({
        event: {
          data: {
            event: 'mount',
            store,
            storeName
          },
          groupId,
          subtitle: 'was mounted',
          time: Date.now(),
          title: storeName
        },
        layerId
      })
    },

    stop: () => {
      api.addTimelineEvent({
        event: {
          data: {
            event: 'unmount',
            store,
            storeName
          },
          groupId,
          subtitle: 'was unmounted',
          time: Date.now(),
          title: storeName
        },
        layerId
      })
    }
  })

  api.on.getInspectorState(payload => {
    if (isValidPayload(payload, app, nodeId)) {
      payload.state = {
        state: {},
        store: {
          active: store.active,
          listeners: store.lc
        }
      }
      payload.state.state = isAtom(store)
        ? [
            {
              editable: true,
              key: 'value',
              value: store.get()
            }
          ]
        : Object.entries(store.get()).map(([key, value]) => ({
            editable: true,
            key,
            value
          }))
    }
  })

  api.on.editInspectorState(payload => {
    if (isValidPayload(payload, app, nodeId) && store.active !== false) {
      let { path, state } = payload
      if (isAtom(store)) {
        store.set(state.value)
      } else {
        store.setKey(path[0], state.value)
      }
    }
  })

  return () => {
    unbindLogger()
  }
}

function createStoreLogger(app, api, store, storeName) {
  inspectorTree.push({
    id: storeName,
    label: storeName
  })
  let groupId = getGroupId()
  createLogger(app, api, store, storeName, groupId, storeName)
}

export function attachStores(app, stores) {
  setupDevtoolsPlugin({ ...pluginConfig, app }, api => {
    for (let [storeName, store] of Object.entries(stores)) {
      createStoreLogger(app, api, store, storeName)
    }
  })
}

export function devtools(app, stores) {
  setupDevtoolsPlugin({ ...pluginConfig, app }, api => {
    api.addTimelineLayer({
      color: 0x1f_49_e0,
      id: layerId,
      label: pluginConfig.label
    })

    api.addInspector({
      icon: 'storage',
      id: inspectorId,
      label: pluginConfig.label,
      treeFilterPlaceholder: 'Search for stores'
    })

    api.on.getInspectorTree(payload => {
      if (payload.app === app && payload.inspectorId === inspectorId) {
        payload.rootNodes = payload.filter
          ? inspectorTree.filter(node => {
              let target = [node.id, node.label]
              if (node.tags && node.tags.length > 0) {
                target.push(node.tags[0].label)
              }
              let found = find(target, payload.filter)
              let children
              if (node.children) {
                children = node.children.some(childNode =>
                  find([childNode.id, childNode.label], payload.filter)
                )
              }
              return found || children
            })
          : inspectorTree
      }
    })

    let unbindSet = []
    api.on.inspectComponent(payload => {
      if (payload.app === app) {
        let { realtime } = api.getSettings()
        if (unbindSet.length > 0) {
          for (let unbind of unbindSet) unbind()
          unbindSet = []
        }
        let instanceStores = payload.componentInstance.proxy._nanostores || []
        instanceStores.forEach((store, index) => {
          if (realtime) {
            unbindSet.push(
              onSet(store, () => {
                notifyComponentUpdate(api, payload.componentInstance)
              })
            )
          }
          payload.instanceData.state.push({
            editable: true,
            key: index.toString(),
            type: pluginConfig.componentStateTypes[0],
            value: store.get()
          })
        })
      }
    })

    api.on.editComponentState(payload => {
      if (
        payload.app === app &&
        payload.type === pluginConfig.componentStateTypes[0]
      ) {
        let {
          componentInstance,
          path: [index, key],
          state: { newKey, remove, value }
        } = payload
        let store = componentInstance.proxy._nanostores[index]
        if (isAtom(store)) {
          let oldValue = store.get()
          let newValue = value
          if (key) {
            if (Array.isArray(oldValue)) {
              newValue = oldValue
              newValue[key] = value
            } else {
              newValue = { ...oldValue, [key]: value }
            }
          }
          store.set(newValue)
        } else {
          if (payload.path.length > 2) return
          if (remove) store.setKey(key)
          if (newKey) {
            store.setKey(newKey, value)
          } else {
            store.setKey(key, value)
          }
        }
      }
    })
  })

  if (stores) {
    attachStores(app, stores)
  }

  return {
    app,
    createLogger,
    eventGroups,
    getGroupId,
    inspectorId,
    inspectorTree,
    isValidPayload,
    layerId,
    pluginConfig,
    pushToInspectorTree
  }
}
