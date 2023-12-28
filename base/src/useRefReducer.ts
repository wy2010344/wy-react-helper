import { useMemo, useReducer } from "react";
import { ReducerFun, } from "./util";
import { Subscriber, valueCenterOf, emptyArray, quote } from "wy-helper";



export type RefReducerResult<F, T> = [T, React.Dispatch<F>, () => T, Subscriber<T>, () => number];
export function useRefReducer<F, M, T>(reducer: ReducerFun<F, T>, init: M, initFun: (m: M) => T): RefReducerResult<F, T>;
export function useRefReducer<F, T>(reducer: ReducerFun<F, T>, init: T, initFun?: (m: T) => T): RefReducerResult<F, T>;
export function useRefReducer<F, T = undefined>(reducer: ReducerFun<F, T>, init?: T, initFun?: (m: T) => T): RefReducerResult<F, T>
export function useRefReducer(reducer: any, init: any, initFun: any) {
  const [value, _dispatch] = useReducer<(any: any, v: any) => any, any>(reducer, init, initFun)
  const { dispatch, get, subscribe, size } = useMemo(function () {
    const value = valueCenterOf((initFun || quote)(init))
    return {
      dispatch(action: any) {
        _dispatch(action)
        value.set(reducer(action))
      },
      get() {
        return value.get()
      },
      subscribe: value.subscribe.bind(value),
      size() {
        return value.poolSize()
      }
    }
  }, emptyArray)
  return [value, dispatch, get, subscribe, size]
}
