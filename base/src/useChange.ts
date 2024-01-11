import { useReducer } from "react"
import { useRefReducer } from "./useRefReducer"
import { RWValue, initRWValue } from "wy-helper"


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

function initRef<T>(value: T, callback: (f: T) => T) {
  function setValue(v: T) {
    value = callback(v)
  }
  return initRWValue(setValue, () => value)
}