import { useMemo, useReducer } from 'react'
import {
  ReduceRowState,
  ReduceState,
  buildSubSetArray,
  buildSubSetObject,
  quote,
} from 'wy-helper'

export function useBuildSubSetObject<
  PARENT extends object,
  K extends keyof PARENT
>(
  parentSet: ReduceState<PARENT>,
  key: K,
  callback?: (v: PARENT[K], parent: PARENT) => PARENT[K]
) {
  return useMemo(() => buildSubSetObject(parentSet, key, callback), [])
}

export function useBuildSubSetArray<T>(
  parentSet: ReduceState<readonly T[]>,
  equal: (v: T) => boolean
): ReduceRowState<T> {
  return useMemo(() => buildSubSetArray(parentSet, equal), [])
}

export declare type ReducerFun<F, T> = (old: T, action: F) => T
export function createUseReducer<A, M, I = M>(
  reducer: ReducerFun<A, M>,
  initFun?: (i: I) => M
) {
  return function (init: I) {
    return useReducer(reducer, init, initFun || (quote as any))
  }
}

export function createUseReducerFun<A, M>(reducer: ReducerFun<A, M>) {
  return function (initFun: () => M) {
    return useReducer(reducer, undefined, initFun)
  }
}
