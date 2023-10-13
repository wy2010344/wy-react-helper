
import { useMemo } from 'react'
import { ReduceState } from './ValueCenter'

export const emptyArray = [] as readonly []
export function quote<T>(v: T, ...vs: any[]) {
  return v
}
export function emptyFun() { }
/**
 * 对react-setState的局部嵌套
 * @param parentSet 
 * @param setChild 
 * @param getChild 
 * @param buildParent 
 */
export function buildSubSet<PARENT, CHILD>(
  parentSet: ReduceState<PARENT>,
  getChild: (s: PARENT) => CHILD,
  buildParent: (s: PARENT, t: CHILD) => PARENT
) {
  return function (setChild: ReduceState<CHILD>) {
    if (typeof (setChild) == 'function') {
      const call = setChild as (v: CHILD) => CHILD
      parentSet(x => buildParent(x, call(getChild(x))))
    } else {
      parentSet(x => buildParent(x, setChild))
    }
  }
}

export function buildSubSetObject<PARENT extends object, K extends keyof PARENT>(
  parentSet: ReduceState<PARENT>,
  key: K,
  callback?: (v: PARENT[K], parent: PARENT) => PARENT[K]
) {
  return buildSubSet(
    parentSet,
    v => v[key],
    (parent, sub) => {
      return {
        ...parent,
        [key]: callback ? callback(sub, parent) : sub
      }
    }
  )
}
export function useBuildSubSetObject<PARENT extends object, K extends keyof PARENT>(
  parentSet: ReduceState<PARENT>,
  key: K,
  callback?: (v: PARENT[K], parent: PARENT) => PARENT[K]
) {
  return useMemo(() => buildSubSetObject(parentSet, key, callback), [])
}

export type ReduceRowState<T> = (() => void) & ((v: ReduceState<T>) => void)
export function buildSubSetArray<T>(
  parentSet: ReduceState<T[]>,
  equal: ((v: T) => boolean)
): ReduceRowState<T> {
  return function () {
    const isRemove = arguments.length == 0
    const v = arguments[0]
    parentSet(ts => {
      const idx = ts.findIndex(equal)
      if (idx < 0) {
        return ts
      }
      ts = ts.slice()
      if (isRemove) {
        ts.splice(idx, 1)
      } else {
        if (typeof (v) == 'function') {
          ts.splice(idx, 1, v(ts[idx]))
        } else {
          ts.splice(idx, 1, v)
        }
      }
      return ts
    })
  }
}

export function useBuildSubSetArray<T>(
  parentSet: ReduceState<T[]>,
  equal: ((v: T) => boolean)
): ReduceRowState<T> {
  return useMemo(() => buildSubSetArray(parentSet, equal), [])
}
