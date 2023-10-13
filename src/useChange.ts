import { useReducer } from "react"


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
