/* eslint-disable perfectionist/sort-objects */
import { buildCreatorLogger, buildLogger } from '@nanostores/logger'
import { setupDevtoolsPlugin } from '@vue/devtools-api'
import { onMount, onSet } from 'nanostores'

const LAYER_ID = 'nanostores'
const INSPECTOR_ID = 'nanostores'
const PLUGIN_CONFIG = {
  componentStateTypes: ['Nano Stores'],
  enableEarlyProxy: true,
  homepage: 'https://github.com/nanostores',
  id: 'io.github.nanostores',
  label: 'Nano Stores',
  logo: 'https://nanostores.github.io/nanostores/logo.svg',
  packageName: '@nanostores/vue',
  settings: {
    keepUnmounted: {
      defaultValue: false,
      label: 'Keep unmounted',
      type: 'boolean'
    },
    realtime: {
      defaultValue: true,
      label: 'Real-time update detection',
      type: 'boolean'
    },
    reduceDataUsage: {
      defaultValue: true,
      label: 'Reduce data usage',
      type: 'boolean'
    }
  }
}

const TAGS = {
  creator: {
    backgroundColor: 0xbb5100,
    label: 'creator',
    textColor: 0xffffff
  },
  nanostores: {
    backgroundColor: 0x000000,
    label: 'nano stores',
    textColor: 0xffffff
  },
  unmounted: {
    backgroundColor: 0x5e5e5e,
    label: 'unmounted',
    textColor: 0xffffff
  }
}

let lastNodeId = 0
let lastGroupId = 0

const getNodeId = () => (lastNodeId += 1)
const getGroupId = () => (lastGroupId += 1)

function find(target, text) {
  return target.some(item =>
    item.toString().toLowerCase().includes(text.toLowerCase())
  )
}

function isAtom(store) {
  return store.setKey === undefined
}

function isCreator(store) {
  return 'cache' in store && 'build' in store
}

function notifyComponentUpdate(api, ...args) {
  let last = 0
  let now = api.now()
  if (now - last > 1000) {
    api.notifyComponentUpdate(...args)
    last = now
  }
}

/**
 * @param data Can include `app`, `inspectorId`, `nodeId` and `type`.
 */
function isValidPayload(payload, data) {
  for (let [key, value] of Object.entries(data)) {
    if (payload[key] !== value) return false
  }
  return true
}

function createLogger(
  api,
  app,
  store,
  storeName,
  inspectorNode,
  opts,
  groupId
) {
  buildLogger(
    store,
    storeName,
    {
      change: ({ actionId, changed, newValue, oldValue, valueMessage }) => {
        let data = {
          changed,
          valueMessage,
          newValue,
          oldValue
        }
        if (valueMessage === undefined) delete data.valueMessage
        if (changed === undefined) delete data.changed

        let subtitle = 'was changed'
        if (changed) subtitle += ` in the ${changed} key`

        api.addTimelineEvent({
          event: {
            data,
            groupId: actionId || lastGroupId,
            subtitle,
            time: api.now(),
            title: storeName
          },
          layerId: LAYER_ID
        })

        api.sendInspectorState(INSPECTOR_ID)
      },

      mount: () => {
        let data = {
          event: 'mount',
          store,
          storeName
        }
        if (api.getSettings().reduceDataUsage) {
          delete data.store
        }
        api.addTimelineEvent({
          event: {
            data,
            groupId: groupId || getGroupId(),
            subtitle: 'was mounted',
            time: api.now(),
            title: storeName
          },
          layerId: LAYER_ID
        })
      },

      unmount: () => {
        let data = {
          event: 'unmount',
          store,
          storeName
        }
        if (api.getSettings().reduceDataUsage) {
          delete data.store
        }
        api.addTimelineEvent({
          event: {
            data,
            groupId: lastGroupId,
            subtitle: 'was unmounted',
            time: api.now(),
            title: storeName
          },
          layerId: LAYER_ID
        })
      }
    },
    opts
  )

  api.on.getInspectorState(payload => {
    if (
      !isValidPayload(payload, {
        app,
        inspectorId: INSPECTOR_ID,
        nodeId: inspectorNode.id
      })
    ) {
      return
    }

    payload.state = {
      State: isAtom(store)
        ? [
            {
              editable: true,
              key: 'value',
              value: store.value
            }
          ]
        : Object.entries(store.value).map(([key, value]) => ({
            editable: true,
            key,
            value
          })),
      Store: {
        active: store.active,
        listeners: store.lc
      }
    }
  })

  api.on.editInspectorState(payload => {
    if (
      !isValidPayload(payload, {
        app,
        inspectorId: INSPECTOR_ID,
        nodeId: inspectorNode.id
      })
    ) {
      return
    }

    let { path, state } = payload
    if (isAtom(store)) {
      store.set(state.value)
    } else {
      store.setKey(path[0], state.value)
    }
  })
}

function createCreatorLogger(
  api,
  app,
  creator,
  creatorName,
  inspectorNode,
  opts
) {
  inspectorNode.tags.push(TAGS.creator)

  buildCreatorLogger(
    creator,
    creatorName,
    {
      build: ({ store, storeName }) => {
        let childId = `${creatorName}:${store.value.id}`
        let childNode = inspectorNode.children.find(i => i.id === childId)
        if (childNode) {
          childNode.tags = []
        } else {
          childNode = {
            children: [],
            id: childId,
            label: storeName,
            tags: []
          }
          inspectorNode.children.push(childNode)
        }

        let groupId = getGroupId()
        let data = {
          event: 'build',
          storeName,
          store,
          by: creatorName
        }
        if (api.getSettings().reduceDataUsage) {
          delete data.store
        }
        api.addTimelineEvent({
          event: {
            data,
            groupId,
            subtitle: `was built by ${creatorName}`,
            time: api.now(),
            title: storeName
          },
          layerId: LAYER_ID
        })
        api.sendInspectorTree(INSPECTOR_ID)

        createLogger(api, app, store, storeName, childNode, opts, groupId)

        onMount(store, () => {
          return () => {
            if (api.getSettings().keepUnmounted) {
              childNode.tags.push(TAGS.unmounted)
            } else {
              let index = inspectorNode.children.findIndex(
                i => i.id === childId
              )
              index > -1 && inspectorNode.children.splice(index, 1)
            }
            api.sendInspectorTree(INSPECTOR_ID)
          }
        })
      }
    },
    opts
  )

  api.on.getInspectorState(payload => {
    if (
      !isValidPayload(payload, {
        app,
        inspectorId: INSPECTOR_ID,
        nodeId: inspectorNode.id
      })
    ) {
      return
    }

    let { reduceDataUsage } = api.getSettings()
    payload.state = {
      Cache: creator.cache
    }
    if (reduceDataUsage) {
      payload.state.Cache = {
        keys: Object.keys(creator.cache)
      }
    }
    opts.getInspectorState &&
      opts.getInspectorState(payload, creator, {
        reduceDataUsage
      })
  })
}

export function devtools(app, storesOrCreators, opts = {}) {
  let inspectorTree = []
  let api = null

  setupDevtoolsPlugin({ ...PLUGIN_CONFIG, app }, _api => {
    api = _api

    if (storesOrCreators) {
      for (let [storeName, store] of Object.entries(storesOrCreators)) {
        let inspectorNode = {
          children: [],
          id: getNodeId(),
          label: storeName,
          tags: []
        }

        inspectorTree.push(inspectorNode)
        api.sendInspectorTree(INSPECTOR_ID)

        if (isCreator(store)) {
          createCreatorLogger(api, app, store, storeName, inspectorNode, opts)
        } else {
          createLogger(api, app, store, storeName, inspectorNode, opts)
        }
      }
    }

    api.addTimelineLayer({
      color: 0x0059d1,
      id: LAYER_ID,
      label: PLUGIN_CONFIG.label
    })

    api.addInspector({
      icon: 'storage',
      id: INSPECTOR_ID,
      label: PLUGIN_CONFIG.label,
      treeFilterPlaceholder: 'Search for stores by id, label or tag'
    })

    api.on.visitComponentTree(payload => {
      if (!isValidPayload(payload, { app })) return

      let proxy = payload.componentInstance?.proxy
      if (proxy && '_nanostores' in proxy) {
        payload.treeNode.tags.push(TAGS.nanostores)
      }
    })

    api.on.getInspectorTree(payload => {
      if (!isValidPayload(payload, { app, inspectorId: INSPECTOR_ID })) return

      payload.rootNodes = payload.filter
        ? inspectorTree.filter(node => {
            let target = [
              node.id,
              node.label,
              ...node.tags.map(tag => tag.label)
            ]
            let found = find(target, payload.filter)
            let children
            if (node.children) {
              children = node.children.some(childNode =>
                find(
                  [
                    childNode.id,
                    childNode.label,
                    ...childNode.tags.map(tag => tag.label)
                  ],
                  payload.filter
                )
              )
            }
            return found || children
          })
        : inspectorTree
    })

    let unbindSet = []
    api.on.inspectComponent(payload => {
      if (!isValidPayload(payload, { app })) return

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
          type: PLUGIN_CONFIG.componentStateTypes[0],
          value: store.value
        })
      })
    })

    api.on.editComponentState(payload => {
      if (
        !isValidPayload(payload, {
          app,
          type: PLUGIN_CONFIG.componentStateTypes[0]
        })
      ) {
        return
      }

      let {
        componentInstance,
        path: [index, key],
        state: { newKey, remove, value }
      } = payload
      let store = componentInstance.proxy._nanostores[index]
      if (isAtom(store)) {
        let oldValue = store.value
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
    })
  })
}
