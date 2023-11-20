
import { useVersion } from "./useVersion"
import { ArrayHelper, createEmptyArray, emptyArray, getOutResolvePromise, removeWhere } from "./util"
import { useRefFun } from "./useRefConst"
import React, { useEffect } from "react"
import { HookRender } from "./HookRender"






export interface ExitModel<V> {
  value: V
  key: any
  enterIgnore?: boolean
  exiting?: boolean
  promise: Promise<any>
  resolve(v?: any): void
}

interface ExitModelImpl<V> extends ExitModel<V> {
  hide?: boolean
  needCollect: boolean
}

/**
 * 主要是有一点,可能会回退
 */
export type ExitAnimateMode = 'pop' | 'shift' | 'wait'


export function useExitAnimate<V>(list: readonly V[], getKey: (v: V) => any, {
  mode,
  exitIgnore,
  enterIgnore,
  onExitComplete,
  onEnterComplete,
  onAnimateComplete,
}: {
  mode?: ExitAnimateMode
  exitIgnore?(v: V): any
  enterIgnore?(v: V): boolean
  onExitComplete?(v?: any): void
  onEnterComplete?(v?: any): void
  onAnimateComplete?(v?: any): void
}): ExitModel<V>[] {
  //用于删除后强制刷新
  const [_, updateVersion] = useVersion()
  //每次render进来,合并cacheList
  const cacheList = useRefFun<ExitModelImpl<V>[]>(createEmptyArray)
  const newCacheList = new ArrayHelper(cacheList.current)
  let destroyCount = 0
  for (let i = newCacheList.get().length - 1; i > -1; i--) {
    //新列表未找到,标记为删除
    const old = newCacheList.get()[i]
    if (!old.exiting && !list.some(v => getKey(v) == old.key)) {
      //新删除了
      if (exitIgnore?.(old.value)) {
        newCacheList.removeAt(i)
      } else {
        destroyCount++
        const [promise, resolve] = getOutResolvePromise()
        newCacheList.replace(i, {
          ...old,
          needCollect: true,
          exiting: true,
          promise,
          resolve,
        })
      }
    }
  }
  let nextIndex = 0
  for (const v of list) {
    const key = getKey(v)
    const oldIndex = newCacheList.get().findIndex(old => old.key == key)
    if (oldIndex < 0) {
      if (mode == 'shift') {
        while (newCacheList.get()[nextIndex]?.exiting) {
          nextIndex++
        }
      }
      const [promise, resolve] = getOutResolvePromise()
      newCacheList.insert(nextIndex, {
        value: v,
        key,
        hide: mode == 'wait' && destroyCount != 0,
        needCollect: true,
        enterIgnore: enterIgnore?.(v),
        promise,
        resolve
      })
    } else {
      newCacheList.replace(oldIndex, {
        ...newCacheList.get()[oldIndex],
        value: v
      })
      nextIndex = oldIndex + 1
    }
  }
  cacheList.current = newCacheList.get() as ExitModelImpl<V>[]

  useEffect(() => {
    const destroyPromises: Promise<any>[] = []
    const thisAddList: ExitModel<any>[] = []
    for (const cache of cacheList.current) {
      if (cache.needCollect) {
        cache.needCollect = false
        if (cache.exiting) {
          cache.promise.then(function () {
            const n = removeWhere(cacheList.current, function (v, i) {
              return v.key == cache.key && v.exiting && v.promise == cache.promise
            })
            if (n) {
              updateVersion()
            }
          })
          destroyPromises.push(cache.promise)
        } else {
          thisAddList.push(cache)
        }
      }
    }
    if (destroyPromises.length && onExitComplete) {
      const allDestroyPromise = Promise.all(destroyPromises)
      allDestroyPromise.then(onExitComplete)
      if (mode == 'wait' && thisAddList.length != 0) {
        allDestroyPromise.then(function () {
          //将本次更新全部标记为展示.
          let n = 0
          for (const cache of cacheList.current) {
            if (cache.hide) {
              const thisAdd = thisAddList.find(v => v.key == cache.key && v.promise == cache.promise)
              if (thisAdd) {
                cache.hide = false
                n++
              }
            }
          }
          if (n) {
            updateVersion()
          }
        })
      }
    }
    if (onEnterComplete) {
      const enterPromises: Promise<any>[] = []
      for (const add of thisAddList) {
        if (!enterIgnore?.(add.value)) {
          enterPromises.push(add.promise)
        }
      }
      if (enterPromises.length) {
        Promise.all(enterPromises).then(onEnterComplete)
      }
    }
    if (onAnimateComplete) {
      const promiseAll = destroyPromises.slice()
      for (const add of thisAddList) {
        if (!enterIgnore?.(add.value)) {
          promiseAll.push(add.promise)
        }
      }
      if (promiseAll.length) {
        Promise.all(promiseAll).then(onAnimateComplete)
      }
    }
  })

  return newCacheList.get().filter(getNotHide)
}

export function ExitAnimate<V>(
  { list,
    getKey,
    render,
    ...args
  }: {
    list: readonly V[],
    getKey(v: V): any
    mode?: ExitAnimateMode
    exitIgnore?(v: V): any
    enterIgnore?(v: V): any
    onExitComplete?(): void
    onEnterComplete?(): void
    onAnimateComplete?(): void
    render: (v: ExitModel<V>) => React.ReactNode
  }
) {
  const outList = useExitAnimate(list, getKey, args)
  return <>{outList.map(value => {
    return render(value)
  })}</>
}

function getNotHide(v: ExitModelImpl<any>) {
  return !v.hide
}

const onlyArray = [1]
function onlyGetArray(v: any) {
  return v
}
function ignoreTrue() {
  return true
}
/**
 * 只有一个元素的
 * 不处理替换,替换可能是各自配置,可能是push等
 * 主要是各自配置出入动画
 */
export function OneExitAnimate(
  {
    show,
    ignore,
    ...args
  }: {
    show?: any,
    ignore?: any
    onAnimateComplete?(): void,
    render: (v: ExitModel<any>) => React.ReactNode
  },
) {
  return <ExitAnimate<any>
    list={show ? onlyArray : emptyArray}
    {...args}
    getKey={onlyGetArray}
    enterIgnore={show && ignore ? ignoreTrue : undefined}
    exitIgnore={!show && ignore ? ignoreTrue : undefined}
  />
}