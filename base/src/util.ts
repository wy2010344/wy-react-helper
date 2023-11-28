
import { useMemo, useReducer } from 'react'
import { ReduceState } from './ValueCenter'

export const emptyArray = [] as readonly []
export function quote<T>(v: T, ...vs: any[]) {
  return v
}
export type EmptyFun = (...vs: any[]) => void
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




export function getOutResolvePromise<T>() {
  let resolve: (v: T) => void
  let reject: (v?: any) => void
  const promise = new Promise<T>(function (_resolve, _reject) {
    resolve = _resolve
    reject = _reject
  })
  return [
    promise,
    resolve!,
    reject!
  ] as const
}

export function objectMap<M, F>(a: Record<string, M>, fun: (v: M, key: string) => F) {
  const out = {} as any
  for (const key in a) {
    out[key] = fun(a[key], key)
  }
  return out as Record<string, F>
}


export function buildRemoveWhere<T, M>(equal: (m: M, a: T, idx: number) => any) {
  return function (vs: T[], m: M) {
    let count = 0
    for (let i = vs.length - 1; i > -1; i--) {
      const row = vs[i]
      if (equal(m, row, i)) {
        count++
        vs.splice(i, 1)
      }
    }
    return count
  }
}


export function simpleEqual<T>(a: T, b: T) {
  return a == b;
}
export function arrayEqual<T>(
  a1: readonly T[],
  a2: readonly T[],
  equal: (x: T, y: T) => boolean
) {
  if (a1 == a2) {
    return true;
  }
  const len = a1.length;
  if (a2.length == len) {
    for (let i = 0; i < len; i++) {
      if (!equal(a1[i], a2[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

export const removeEqual = buildRemoveWhere(simpleEqual)

export const removeWhere = buildRemoveWhere(function <T>(fun: (v: T, i: number) => any, v: T, i: number) {
  return fun(v, i)
})

export function createEmptyArray<T>(): T[] {
  return []
}


export declare type ReducerFun<F, T> = (old: T, action: F) => T;
export function createUseReducer<A, M, I = M>(
  reducer: ReducerFun<A, M>,
  initFun?: (i: I) => M
) {
  return function (init: I) {
    return useReducer(reducer, init, initFun || quote as any)
  }
}

export function createUseReducerFun<A, M>(
  reducer: ReducerFun<A, M>,
) {
  return function (initFun: () => M) {
    return useReducer(reducer, undefined, initFun)
  }
}




export class ArrayHelper<V>{
  private dirty = false
  private array: V[]
  constructor(
    _array: readonly V[]
  ) {
    this.array = _array as V[]
  }

  get(): readonly V[] {
    return this.array
  }
  private safeCopy() {
    if (!this.dirty) {
      this.dirty = true
      this.array = this.array.slice()
    }
  }
  insert(n: number, v: V) {
    this.safeCopy()
    this.array.splice(n, 0, v)
  }
  removeAt(n: number) {
    this.safeCopy()
    this.array.splice(n, 1)
  }
  replace(n: number, v: V) {
    this.safeCopy()
    this.array[n] = v
  }

  removeWhere(fun: (v: V, i: number) => any) {
    let count = 0
    for (let i = this.array.length - 1; i > -1; i--) {
      const row = this.array[i]
      if (fun(row, i)) {
        count++
        this.removeAt(i)
      }
    }
    return count
  }
}