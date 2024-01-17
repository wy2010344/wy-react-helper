
import { useVersion } from "./useVersion"
import { ArrayHelper, createEmptyArray, emptyArray, emptyObject, getOutResolvePromise } from "wy-helper"
import { useRefFun } from "./useRefConst"
import React, { useEffect } from "react"






export interface ExitModel<V> {
  key: Promise<any>
  value: V
  originalKey: any
  enterIgnore?: boolean
  exiting?: boolean
  promise: Promise<any>
  resolve(v?: any): void
}

interface ExitModelImpl<V> extends ExitModel<V> {
  hide?: boolean | ExitModel<V>
}

/**
 * 主要是有一点,可能会回退
 */
export type ExitAnimateMode = 'pop' | 'shift'

export type ExitAnimateArg<V> = {
  mode?: ExitAnimateMode
  wait?: 'in-out' | 'out-in'
  exitIgnore?(v: V): any
  enterIgnore?(v: V): boolean
  onExitComplete?(v?: any): void
  onEnterComplete?(v?: any): void
  onAnimateComplete?(v?: any): void
}
export function useExitAnimate<V>(list: readonly V[], getKey: (v: V) => any, {
  mode,
  wait,
  exitIgnore,
  enterIgnore,
  onExitComplete,
  onEnterComplete,
  onAnimateComplete,
}: ExitAnimateArg<V> = emptyObject): ExitModel<V>[] {
  //用于删除后强制刷新
  const [_, updateVersion] = useVersion()
  //每次render进来,合并cacheList,因为有回滚与副作用,所以必须保持所有变量的无副作用
  const cacheList = useRefFun<ExitModelImpl<V>[]>(createEmptyArray)

  const newCacheList = new ArrayHelper(cacheList.current)
  const thisAddList: ExitModelImpl<V>[] = []
  const thisRemoveList: ExitModelImpl<V>[] = []

  newCacheList.forEachRight(function (old, i) {
    if (!old.exiting && !list.some(v => getKey(v) == old.originalKey)) {
      //新删除了
      if (exitIgnore?.(old.value)) {
        newCacheList.removeAt(i)
      } else {
        const [promise, resolve] = getOutResolvePromise()
        const cache: ExitModelImpl<V> = {
          ...old,
          exiting: true,
          promise,
          resolve,
          hide: old
        }
        newCacheList.replace(i, cache)
        thisRemoveList.push(cache)
        promise.then(function () {
          const eCacheList = new ArrayHelper(cacheList.current)
          const n = eCacheList.removeWhere(old => old.key == cache.key)
          if (n) {
            updateVersion()
            cacheList.current = eCacheList.get() as ExitModelImpl<V>[]
          }
        })
      }
    }
  })
  let nextIndex = 0
  for (const v of list) {
    const key = getKey(v)
    const oldIndex = newCacheList.get().findIndex(old => !old.exiting && old.originalKey == key)
    if (oldIndex < 0) {
      if (mode == 'shift') {
        while (newCacheList.get()[nextIndex]?.exiting) {
          nextIndex++
        }
      }
      const [promise, resolve] = getOutResolvePromise()
      const cache: ExitModelImpl<V> = {
        key: promise,
        value: v,
        originalKey: key,
        hide: wait == 'out-in' && thisRemoveList.length != 0,
        enterIgnore: enterIgnore?.(v),
        promise,
        resolve
      }
      newCacheList.insert(nextIndex, cache)
      thisAddList.push(cache)
    } else {
      newCacheList.replace(oldIndex, {
        ...newCacheList.get()[oldIndex],
        value: v
      })
      nextIndex = oldIndex + 1
    }
  }
  if (!(thisAddList.length && wait == 'in-out')) {
    thisRemoveList.forEach(row => row.hide = false)
  }
  /**
   * useRef,不应该在render中设置值,官方这样说的
   * useEffect在Strict.Mode会执行两次,所以最好严格修改
   * 在render中创建的promise,当然可能会回滚掉,但是也不会生效.
   */
  // cacheList.current = newCacheList.get() as ExitModelImpl<V>[]
  useEffect(() => {
    const removePromiseList: Promise<any>[] = thisRemoveList.map(v => v.promise)

    if (removePromiseList.length) {
      const allDestroyPromise = Promise.all(removePromiseList)
      if (onExitComplete) {
        allDestroyPromise.then(onExitComplete)
      }
      const onExitWait = wait == 'out-in' && thisAddList.length != 0
      if (onExitWait) {
        allDestroyPromise.then(function () {
          //将本次更新全部标记为展示.
          const eCacheList = new ArrayHelper(cacheList.current)
          let n = 0
          eCacheList.forEach(function (cache, x) {
            if (cache.hide) {
              const row = thisAddList.find(v => v.key == cache.key)
              if (row) {
                eCacheList.replace(x, {
                  ...cache,
                  hide: false
                })
                n++
              }
            }
          })
          if (n) {
            updateVersion()
            cacheList.current = eCacheList.get() as ExitModelImpl<V>[]
          }
        })
      }
    }
    const addPromiseList: Promise<any>[] = []
    for (const thisAdd of thisAddList) {
      if (!enterIgnore?.(thisAdd.value)) {
        addPromiseList.push(thisAdd.promise)
      }
    }
    if (addPromiseList.length) {
      const allEnterPromise = Promise.all(addPromiseList)
      if (onEnterComplete) {
        allEnterPromise.then(onEnterComplete)
      }
      const onEnterWait = wait == 'in-out' && thisRemoveList.length != 0
      if (onEnterWait) {
        allEnterPromise.then(function () {
          //将本次更新全部标记为展示.
          const eCacheList = new ArrayHelper(cacheList.current)
          let n = 0
          eCacheList.forEach(function (cache, x) {
            if (cache.hide) {
              const row = thisRemoveList.find(v => v.key == cache.key)
              if (row) {
                eCacheList.replace(x, {
                  ...cache,
                  hide: false
                })
                n++
              }
            }
          })
          if (n) {
            updateVersion()
            cacheList.current = eCacheList.get() as ExitModelImpl<V>[]
          }
        })
      }
    }
    if (onAnimateComplete && (addPromiseList.length || removePromiseList.length)) {
      Promise.all([...addPromiseList, ...removePromiseList]).then(onAnimateComplete)
    }
    cacheList.current = newCacheList.get() as ExitModelImpl<V>[]
  })
  return newCacheList.get().map(getHideAsShow).filter(getNotHide)
}

/**
 * 有一个可以直接嵌入
 * @param param0 
 * @returns 
 */
export function ExitAnimate<V>(
  { list,
    getKey,
    render,
    ...args
  }: {
    list: readonly V[],
    getKey(v: V): any
    render: (v: ExitModel<V>) => React.ReactNode
  } & ExitAnimateArg<V>
) {
  const outList = useExitAnimate(list, getKey, args)
  return <>{outList.map(value => {
    return render(value)
  })}</>
}

function getNotHide(v: ExitModelImpl<any>) {
  return !v.hide
}
function getHideAsShow(v: ExitModelImpl<any>) {
  if (v.hide && v.exiting && typeof v.hide == 'object') {
    return {
      ...v,
      ...v.hide,
      exiting: false
    }
  }
  return v
}

function onlyGetArray(v: any) {
  return 1
}
function ignoreTrue() {
  return true
}
/**
 * 只有一个元素的
 * 不处理替换,替换可能是各自配置,可能是push等
 * 主要是各自配置出入动画
 */
export function OneExitAnimate<T>(
  {
    show,
    ignore,
    ...args
  }: {
    show?: T | undefined | null | false | void,
    ignore?: any
    onAnimateComplete?(): void,
    render: (v: ExitModel<T>) => React.ReactNode
  },
) {
  return <ExitAnimate<T>
    list={show ? [show] : emptyArray}
    {...args}
    getKey={onlyGetArray}
    enterIgnore={show && ignore ? ignoreTrue : undefined}
    exitIgnore={!show && ignore ? ignoreTrue : undefined}
  />
}