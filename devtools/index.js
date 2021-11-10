import {
  STORE_UNMOUNT_DELAY,
  lastAction,
  onBuild,
  onStart,
  onStop,
  onSet
} from 'nanostores'
import { setupDevtoolsPlugin } from '@vue/devtools-api'

const layerId = 'nanostores'
const inspectorId = 'nanostores'
const pluginConfig = {
  id: 'io.github.nanostores',
  label: 'Nanostores',
  packageName: '@nanostores/vue',
  homepage: 'https://github.com/nanostores',
  logo: 'https://nanostores.github.io/nanostores/logo.svg',
  settings: {
    keepUnmounted: {
      label: 'Keep unmounted',
      type: 'boolean',
      defaultValue: false
    }
  },
  enableEarlyProxy: true,
  componentStateTypes: ['Nanostores']
}
const tags = {
  template: {
    label: 'Template',
    textColor: 0xffffff,
    backgroundColor: 0xbb5100
  },
  unmounted: {
    label: 'Unmounted',
    textColor: 0xffffff,
    backgroundColor: 0x5c5c5c
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

export function devtools(app) {
  setupDevtoolsPlugin({ ...pluginConfig, app }, api => {
    api.addTimelineLayer({
      id: layerId,
      label: 'Nanostores',
      color: 0x1f49e0
    })

    api.addInspector({
      id: inspectorId,
      label: 'Nanostores',
      icon: 'storage',
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

    let notifyComponentUpdate = (...args) => {
      let last = 0
      let now = Date.now()
      if (now - last > 1000) {
        api.notifyComponentUpdate(...args)
        last = now
      }
    }

    let unbindSet = []
    api.on.inspectComponent(payload => {
      if (payload.app === app) {
        if (unbindSet.length > 0) {
          for (let unbind of unbindSet) unbind()
          unbindSet = []
        }
        let stores = payload.componentInstance.proxy._nanostores || []
        stores.forEach((store, index) => {
          unbindSet.push(
            onSet(store, () => {
              notifyComponentUpdate(payload.componentInstance)
            })
          )
          payload.instanceData.state.push({
            type: pluginConfig.componentStateTypes[0],
            key: index.toString(),
            editable: true,
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
        layerId,
        event: {
          time: Date.now(),
          title: storeName,
          subtitle: 'was mounted',
          data: {
            event: 'mount',
            storeName,
            store
          },
          groupId
        }
      })
    }
  })

  let unbindStop = onStop(store, () => {
    setTimeout(() => {
      if (mounted) {
        mounted = false
        api.addTimelineEvent({
          layerId,
          event: {
            time: Date.now(),
            title: storeName,
            subtitle: 'was unmounted',
            data: {
              event: 'unmount',
              storeName,
              store
            },
            groupId
          }
        })
      }
    }, STORE_UNMOUNT_DELAY)
  })

  let unbindSet = onSet(store, ({ changed, newValue }) => {
    api.sendInspectorState(inspectorId)
    api.notifyComponentUpdate()

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
      layerId,
      event: {
        time: Date.now(),
        title: storeName,
        subtitle: 'was changed',
        data,
        groupId
      }
    })
  })

  api.on.getInspectorState(payload => {
    if (isValidPayload(payload, app, nodeId)) {
      let action = store[lastAction]
      payload.state = {
        state: {},
        store: {
          listeners: store.lc
        }
      }
      if (action) {
        payload.state.store.lastAction = action
      }
      if (isAtom(store)) {
        payload.state.state = [
          {
            key: 'value',
            value: store.get(),
            editable: true
          }
        ]
      } else {
        payload.state.state = Object.entries(store.get()).map(
          ([key, value]) => ({
            key,
            value,
            editable: true
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
  let settings = api.getSettings()
  let inspectorNode = {
    id: templateName,
    label: templateName,
    tags: [tags.template],
    children: []
  }
  inspectorTree.push(inspectorNode)

  onBuild(template, ({ store }) => {
    let built = true
    let childId = `${templateName}:${store.get().id}`
    let storeName = nameGetter(store, templateName)
    let groupId = (eventGroups += 1)
    api.addTimelineEvent({
      layerId,
      event: {
        time: Date.now(),
        title: storeName,
        subtitle: `was built by ${templateName}`,
        data: {
          event: `build`,
          storeName,
          store,
          by: templateName
        },
        groupId
      }
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
          if (settings.keepUnmounted) {
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
        template: {
          plural: template.plural,
          remote: template.remote,
          offline: template.offline
        },
        cache: template.cache
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
