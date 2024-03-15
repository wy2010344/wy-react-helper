import { useEffect } from "react"
import { useChangeFun } from "./useChange"
import { EmptyFun, ReadValueCenter, quote } from "wy-helper"

/**
 * 
 * @param subscribe 最好保证订阅函数的独立
 * @param getSnapshot 
 * @returns 
 */
export function useSyncExternalStore<T>(subscribe: (callback: EmptyFun) => EmptyFun, getSnapshot: () => T) {
  return useStoreTriggerRender({
    get: getSnapshot,
    subscribe
  })
}

/**
 * 显然应该使用useRetReducer,以state为中心,valueCenter为辅助.这样状态能顺利地同步下来,事件也能顺利地同步下来.
 * 进而,层级的valueCenter(依赖局部的valueCenter)
 * @param store 
 * @param arg 只能初始化,中间不可以改变,即使改变,也是跟随的
 */
/**
 *
 * @param store
 * @param arg 只能初始化,中间不可以改变,即使改变,也是跟随的
 */
export function useStoreTriggerRender<T, M>(store: ReadValueCenter<T>, filter: (a: T) => M): M;
export function useStoreTriggerRender<T>(store: ReadValueCenter<T>, filter?: (a: T) => T): T;
export function useStoreTriggerRender<T>(store: ReadValueCenter<T>) {
  const filter = arguments[1] || quote
  const [state, setState] = useChangeFun(() => filter(store.get()))
  useEffect(() => {
    const v = filter(store.get())
    if (state != v) {
      setState(v)
    }
    return store.subscribe(function (d) {
      setState(filter(d))
    })
  }, [store.subscribe, filter])
  return state
}