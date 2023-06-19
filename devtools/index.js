import { setupDevtoolsPlugin } from '@vue/devtools-api'
import {
  lastAction,
  onBuild,
  onSet,
  onStart,
  onStop,
  STORE_UNMOUNT_DELAY
} from 'nanostores'

const layerId = 'nanostores'
const inspectorId = 'nanostores'
const pluginConfig = {
  componentStateTypes: ['Nanostores'],
  enableEarlyProxy: true,
  homepage: 'https://github.com/nanostores',
  id: 'io.github.nanostores',
  label: 'Nanostores',
  logo: 'https://nanostores.github.io/nanostores/logo.svg',
  packageName: '@nanostores/vue',
  settings: {
    keepUnmounted: {
      defaultValue: false,
      label: 'Keep unmounted',
      type: 'boolean'
    },
    realtimeUpdateDetected: {
      defaultValue: true,
      label: 'Real-time update detected',
      type: 'boolean'
    }
  }
}
const tags = {
  template: {
    backgroundColor: 0xbb5100,
    label: 'Template',
    textColor: 0xffffff
  },
  unmounted: {
    backgroundColor: 0x5c5c5c,
    label: 'Unmounted',
    textColor: 0xffffff
  }
}

let eventGroups = 0
let inspectorTree = []

function find(target, text) {
  return target.some(item => item.toLowerCase().includes(text.toLowerCase()))
}

function isAtom(store) {
  return typeof store.setKey === 'undefined'
}

function notifyComponentUpdate(api, ...args) {
  let last = 0
  let now = Date.now()
  if (now - last > 1000) {
    api.notifyComponentUpdate(...args)
    last = now
  }
}

export function devtools(app) {
  setupDevtoolsPlugin({ ...pluginConfig, app }, api => {
    api.addTimelineLayer({
      color: 0x1f49e0,
      id: layerId,
      label: 'Nanostores'
    })

    api.addInspector({
      icon: 'storage',
      id: inspectorId,
      label: 'Nanostores',
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
        let { realtimeUpdateDetected } = api.getSettings()
        if (unbindSet.length > 0) {
          for (let unbind of unbindSet) unbind()
          unbindSet = []
        }
        let stores = payload.componentInstance.proxy._nanostores || []
        stores.forEach((store, index) => {
          if (realtimeUpdateDetected) {
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
          path: [index, key],
          state: { newKey, remove, value }
        } = payload
        let store = payload.componentInstance.proxy._nanostores[index]
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
          if (remove) store.setKey(key, undefined)
          if (newKey) {
            store.setKey(newKey, value)
          } else {
            store.setKey(key, value)
          }
        }
      }
    })
  })
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

  let mounted
  let unbindStart = onStart(store, () => {
    if (!mounted) {
      mounted = true
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
    }
  })

  let unbindStop = onStop(store, () => {
    setTimeout(() => {
      if (mounted) {
        mounted = false
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
    }, STORE_UNMOUNT_DELAY)
  })

  let unbindSet = onSet(store, ({ changed, newValue }) => {
    api.sendInspectorState(inspectorId)
    if (api.getSettings().realtimeUpdateDetected) {
      notifyComponentUpdate(api)
    }

    let action = store[lastAction]
    let data = {
      action,
      key: changed,
      newValue,
      oldValue: store.get()
    }
    if (typeof data.action === 'undefined') delete data.action
    if (typeof data.key === 'undefined') delete data.key
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
      if (isAtom(store)) {
        payload.state.state = [
          {
            editable: true,
            key: 'value',
            value: store.get()
          }
        ]
      } else {
        payload.state.state = Object.entries(store.get()).map(
          ([key, value]) => ({
            editable: true,
            key,
            value
          })
        )
      }
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
    unbindStart()
    unbindStop()
    unbindSet()
  }
}

function createTemplateLogger(app, api, template, templateName, nameGetter) {
  let inspectorNode = {
    children: [],
    id: templateName,
    label: templateName,
    tags: [tags.template]
  }
  inspectorTree.push(inspectorNode)

  onBuild(template, ({ store }) => {
    let built = true
    let childId = `${templateName}:${store.get().id}`
    let storeName = nameGetter(store, templateName)
    let groupId = (eventGroups += 1)
    api.addTimelineEvent({
      event: {
        data: {
          by: templateName,
          event: `build`,
          store,
          storeName
        },
        groupId,
        subtitle: `was built by ${templateName}`,
        time: Date.now(),
        title: storeName
      },
      layerId
    })
    let childIndex = inspectorNode.children.findIndex(i => i.id === childId)
    if (childIndex > -1) {
      inspectorNode.children[childIndex].tags = []
    } else {
      childIndex = inspectorNode.children.length
      inspectorNode.children.push({
        id: childId,
        label: storeName,
        tags: []
      })
    }
    let destroyLogger = createLogger(
      app,
      api,
      store,
      storeName,
      groupId,
      childId
    )
    let unbindStop = onStop(store, () => {
      setTimeout(() => {
        if (built) {
          built = false
          if (api.getSettings().keepUnmounted) {
            inspectorNode.children[childIndex].tags.push(tags.unmounted)
          } else {
            let index = inspectorNode.children.findIndex(i => i.id === childId)
            index > -1 && inspectorNode.children.splice(index, 1)
          }
          api.sendInspectorTree(inspectorId)
          destroyLogger()
          unbindStop()
        }
      }, STORE_UNMOUNT_DELAY + 1)
    })
  })

  api.on.getInspectorState(payload => {
    if (isValidPayload(payload, app, templateName)) {
      payload.state = {
        cache: template.cache,
        template: {
          offline: template.offline,
          plural: template.plural,
          remote: template.remote
        }
      }
      if (template.filters) {
        payload.state.template.filters = template.filters
      }
    }
  })
}

function createStoreLogger(app, api, store, storeName) {
  inspectorTree.push({
    id: storeName,
    label: storeName
  })
  let groupId = (eventGroups += 1)
  createLogger(app, api, store, storeName, groupId, storeName)
}

const defaultNameGetter = (store, templateName) =>
  `${templateName}:${store.get().id}`

export function attachStores(app, stores, opts = {}) {
  setupDevtoolsPlugin({ ...pluginConfig, app }, api => {
    let nameGetter = opts.nameGetter || defaultNameGetter
    Object.entries(stores).forEach(([storeName, store]) => {
      'build' in store
        ? createTemplateLogger(app, api, store, storeName, nameGetter)
        : createStoreLogger(app, api, store, storeName)
    })
  })
}
