import { useReducer } from "react"
import { useRefReducer } from "./useRefReducer"
import { GetValue, RWValue, SetValue, initRWValue, quote } from "wy-helper"
import { ReducerFun } from "./util"


type ReducerResult<T, M> = [T, (v: M) => void]
function change<T>(old: T, action: T) {
  return action
}

export function useChange<T = undefined>(): ReducerResult<T | undefined, T | undefined>
export function useChange<M, T>(v: M, init: (v: M) => T): ReducerResult<T, T>
export function useChange<T>(v: T): ReducerResult<T, T>
export function useChange() {
  const [init, trans] = arguments
  return useReducer(change, init, trans)
}

export function useChangeFun<T>(fun: () => T): ReducerResult<T, T> {
  return useChange(undefined, fun)
}

export function createUseRefValue<T, O, M = T>(
  create: (get: GetValue<T>, set: SetValue<T>) => O,
  init?: (a: M) => T
) {
  function initRef(
    reducer: ReducerFun<T, T>,
    value: T,
    dispatch: (f: T) => void) {
    function setValue(v: T) {
      dispatch(v)
      value = reducer(value, v)
    }
    return create(() => value, setValue)
  }
  const initF = (init || quote) as (a: M) => T
  return function (initArg: M) {
    return useRefReducer(initRef, change, initArg, initF)
  }
}


type RefValueOut<T> = [T, RWValue<T>]
export function useRefValue<T = undefined>(): RefValueOut<T | undefined>
export function useRefValue<M, T>(v: M, init: (v: M) => T): RefValueOut<T>
export function useRefValue<T>(v: T): RefValueOut<T>
export function useRefValue() {
  return useRefReducer(initRef, change, arguments[0], arguments[1])
}
export function useRefValueFun<T>(fun: () => T): RefValueOut<T> {
  return useRefValue(undefined, fun)
}
function initRef<T>(reducer: ReducerFun<T, T>, value: T, dispatch: (f: T) => void) {
  function setValue(v: T) {
    dispatch(v)
    value = reducer(value, v)
  }
  return initRWValue(() => value, setValue)
}