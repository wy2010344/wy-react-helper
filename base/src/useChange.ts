import { useReducer } from "react"
import { RefReducerResult, useRefReducer } from "./useRefReducer"


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



export function useRefChange<T = undefined>(): RefReducerResult<T | undefined, T | undefined>
export function useRefChange<M, T>(v: M, init: (v: M) => T): RefReducerResult<T, T>
export function useRefChange<T>(v: T): RefReducerResult<T, T>
export function useRefChange<T>(): RefReducerResult<T, T> {
  return useRefReducer(change, arguments[0], arguments[1])
}
export function useRefChangeFun<T>(fun: () => T): RefReducerResult<T, T> {
  return useRefChange(undefined, fun)
}