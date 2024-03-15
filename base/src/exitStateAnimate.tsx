import { useEffect, useRef } from "react";
import { ArrayHelper, EmptyFun, emptyArray, emptyObject, getOutResolvePromise } from "wy-helper";
import { createUseReducer } from "./util";


type DirectionState = 'enter' | 'exit'
/**
 * 有一种情况,因为在退出与进入中,原本的key发生重复
 */
type CacheModel<V> = {
  value: V
  key: any
  state: DirectionState
  promise: Promise<any>
  resolve: EmptyFun
}

const useCacheList = createUseReducer(function <V>(list: readonly CacheModel<V>[], action: {
  method: 'replace'
  value: readonly CacheModel<V>[]
} | {
  method: 'remove'
  key: any
  promise: Promise<any>
}) {
  if (action.method == 'replace') {
    return action.value
  }
  if (action.method == 'remove') {
    return list.filter(v => v.state == 'exit'
      && v.key == action.key
      && v.promise == action.promise)
  }
  return list
})

type StateMode = "shift" | "pop"
export function useExitStateAnimate<V>(
  list: readonly V[],
  getKey: (v: V) => any,
  {
    mode = 'shift',
    onEnterComplete,
    onExitComplete,
    onAnimationComplete
    // wait
  }: {
    mode?: StateMode
    /**
     * 不wait
     * 先进后出
     * 先出后进
     * 先不做,与will冲突的样式
     */
    // wait?: 'in-out' | 'out-in'
    onEnterComplete?: EmptyFun
    onExitComplete?: EmptyFun
    onAnimationComplete?: EmptyFun
  } = emptyObject
) {
  const lastRenderRef = useRef<readonly V[]>()
  const [cacheList, dispatch] = useCacheList(emptyArray as unknown as readonly CacheModel<V>[])


  function mergeAddList(
    oldList: () => readonly {
      key: any
      state: 'enter' | 'exit'
    }[],
    run: (nextIndex: number, v: V, key: any) => void
  ) {
    let nextIndex = 0
    for (const v of list) {
      const key = getKey(v)
      const oldIndex = oldList().findIndex(old => old.key == key && old.state != 'exit')
      if (oldIndex < 0) {
        //尚且不存在
        if (mode == 'shift') {
          while (oldList()[nextIndex].state == 'exit') {
            nextIndex++
          }
        }
        run(nextIndex, v, key)
      } else {
        //已经存在,则需要更新value,否则退出后持有的值是最旧的
        //就需要ref保存上一次的Value.
      }
    }
  }
  useEffect(() => {
    const cachesH = new ArrayHelper(cacheList)

    const exitPromiseList: Promise<any>[] = []
    cachesH.forEach(function (cache, i) {
      if (cache.state != 'exit' && !list.find(v => getKey(v) == cache.key)) {
        const [promise, resolve] = getOutResolvePromise()
        cachesH.replace(i, {
          ...cache,
          value: lastRenderRef.current?.find(v => getKey(v) == cache.key)!,
          state: 'exit',
          promise,
          resolve
        })
        exitPromiseList.push(promise)
        promise.then(function () {
          dispatch({
            method: "remove",
            key: cache.key,
            promise
          })
        })
      }
    })

    const enterPromiseList: Promise<any>[] = []
    mergeAddList(cachesH.get.bind(cachesH), function (nextIndex, v, key) {
      const [promise, resolve] = getOutResolvePromise()
      enterPromiseList.push(promise)
      cachesH.insert(nextIndex, {
        value: v,
        key,
        promise,
        resolve,
        state: 'enter'
      })
    })

    if (cachesH.isDirty()) {
      //只在变化时触发render
      dispatch({
        method: "replace",
        value: cachesH.get()
      })
      if (onEnterComplete) {
        Promise.all(enterPromiseList).then(onEnterComplete)
      }
      if (onExitComplete) {
        Promise.all(exitPromiseList).then(onExitComplete)
      }
      if (onAnimationComplete) {
        Promise.all([...enterPromiseList, exitPromiseList]).then(onAnimationComplete)
      }
    }
    lastRenderRef.current = list
  })

  /**
   * 增加本帧到下一帧,
   * will-enter与will-exit 两种
   */
  const renderList = cacheList.map<{
    state: 'enter' | 'exit'
    value: V
    key: any
  } & ({
    will?: never
    promise: Promise<any>
    resolve: EmptyFun
  } | {
    will: true
  })>(cache => {
    if (cache.state == 'exit') {
      return cache
    } else {
      const currentValue = list.find(v => getKey(v) == cache.key)
      if (currentValue) {
        return {
          ...cache,
          value: currentValue
        }
      } else {
        return {
          key: cache.key,
          will: true,
          state: 'exit',
          value: lastRenderRef.current?.find(v => getKey(v) == cache.key)!,
        } as const
      }
    }
  })

  mergeAddList(() => renderList, function (nextIndex, v, key) {
    renderList.splice(nextIndex, 0, {
      value: v,
      key,
      will: true,
      state: 'enter'
    })
  })

  return renderList
}