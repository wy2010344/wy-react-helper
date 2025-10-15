import { useMemo, useReducer } from 'react';
import { ReducerFun } from './util';
import { emptyArray, quote, SetValue } from 'wy-helper';

export type BaseInit<T, F, G> = (
  reducer: ReducerFun<F, T>,
  init: T,
  dispatch: (f: F) => void
) => G;

export type RefReducerResult<T, G> = [T, G];
export function useRefReducer<G, F, M, T>(
  baseInit: BaseInit<T, F, G>,
  reducer: ReducerFun<F, T>,
  init: M,
  initFun: (m: M) => T
): RefReducerResult<T, G>;
export function useRefReducer<G, F, T>(
  baseInit: BaseInit<T, F, G>,
  reducer: ReducerFun<F, T>,
  init: T,
  initFun?: (m: T) => T
): RefReducerResult<T, G>;
export function useRefReducer<G, F, T = undefined>(
  baseInit: BaseInit<T, F, G>,
  reducer: ReducerFun<F, T>,
  init?: T,
  initFun?: (m: T) => T
): RefReducerResult<T, G>;
export function useRefReducer(
  baseInit: BaseInit<any, any, any>,
  reducer: any,
  init: any,
  initFun: any
) {
  const [value, _dispatch] = useReducer<(any: any, v: any) => any, any>(
    reducer,
    init,
    initFun
  );
  const out = useMemo(function () {
    return baseInit(reducer, (initFun ?? quote)(init), _dispatch);
  }, emptyArray);
  return [value, out];
}
