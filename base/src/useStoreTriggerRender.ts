import { useCallback, useEffect, useRef } from "react"
import { ReadOnlyRef } from "./useAlaways"
import { useChange } from "./useChange"
import { ValueCenter, emptyArray, quote } from "wy-helper"

type RefState<T> = [T, (v: T) => void, ReadOnlyRef<T>]
export function useRefState<T, M>(init: M, trans: (v: M) => T): RefState<T>
export function useRefState<T>(init: T): RefState<T>
export function useRefState() {
  const [init, trans] = arguments
  const [state, setState] = useChange(init, trans)
  const lock = useRef(state)
  const setValue = useCallback((value) => {
    if (value != lock.current) {
      lock.current = value
      setState(value)
    }
  }, emptyArray)
  return [state, setValue, lock]
}

/**
 * 显然应该使用useRetReducer,以state为中心,valueCenter为辅助.这样状态能顺利地同步下来,事件也能顺利地同步下来.
 * 进而,层级的valueCenter(依赖局部的valueCenter)
 * @param store 
 * @param arg 只能初始化,中间不可以改变,即使改变,也是跟随的
 */
export function useStoreTriggerRender<T, M>(store: ValueCenter<T>, arg: {
  filter(a: T): M,
  onBind?(a: M): void
}): M
export function useStoreTriggerRender<T>(store: ValueCenter<T>, arg?: {
  filter?(a: T): T,
  onBind?(a: T): void
}): T
export function useStoreTriggerRender<T>(store: ValueCenter<T>): T {
  const arg = arguments[1]
  const filter = arg?.filter || quote
  const [state, setState] = useRefState(store.get(), filter)
  useEffect(function () {
    function setValue(v: T) {
      const newState = filter(v) as T
      setState(newState)
      return newState
    }
    const newValue = store.get() as T
    setValue(newValue)
    arg?.onBind?.(newValue)
    return store.subscribe(setState)
  }, [store])
  return state as T
}