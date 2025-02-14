
import { useEffect, useMemo } from "react";
import { Compare, createSignal, emptyArray, genTemplateStringS2, GetValue, memo, SetValue, simpleNotEqual, SyncFun, trackSignal, VType } from "wy-helper";
import { useChange, useRefValueFun } from "./useChange";
import { useConstDep, useConstFrom } from "./useRef";

export function useSignal<T>(n: T, shouldChange: Compare<T> = simpleNotEqual) {
  return useConstFrom(() => createSignal(n, shouldChange))
}

export function useSignalFrom<T>(n: () => T, shouldChange: Compare<T> = simpleNotEqual) {
  return useConstFrom(() => createSignal(n(), shouldChange))
}
/**
 * 动态依赖改变
 * @param fun 
 * @param deps 
 * @returns 
 */
export function useSignalMemoDep<T>(fun: GetValue<T>, deps?: any) {
  return useMemo(() => memo(fun), deps)
}
/**
 * 优化中间计算的缓存,其实一般不存在
 * @param fun 
 * @param deps 
 * @returns 
 */
export function useSignalMemo<T>(fun: GetValue<T>) {
  return useSignalMemoDep(fun, emptyArray)
}
/**
 * get与shouldChange只使用第一次
 * @param get 
 * @param shouldChange 
 * @returns 
 */
export function useSignalState<T>(get: GetValue<T>, shouldChange: Compare<T> = simpleNotEqual) {
  const [a, ref] = useRefValueFun(get)
  useEffect(() => {
    //有可能重复设置?
    return trackSignal(get, v => {
      if (shouldChange(v, ref.get())) {
        ref.set(v)
      }
    })
  }, emptyArray)
  return a
}

export function useSignalEffect<T>(get: GetValue<T>, callback: SetValue<T>) {
  useEffect(() => {
    return trackSignal(get, callback)
  }, emptyArray)
}
export function useSignalSyncDep<T>(get: GetValue<T>, dep?: any) {
  return useConstDep<SyncFun<T>>(function () {
    const [set, a, b, c] = arguments
    return trackSignal(get, set, a, b, c)
  }, dep)
}
export function useSignalSync<T>(get: GetValue<T>) {
  return useSignalSyncDep(get, emptyArray)
}
export function useSignalSyncTemplate(ts: TemplateStringsArray, ...vs: VType[]) {
  return useSignalSyncDep(() => {
    return genTemplateStringS2(ts, vs)
  }, vs)
}



export function SignalValue({
  get
}: {
  get: GetValue<JSX.Element>
}) {
  const [v, setV] = useChange<JSX.Element>()
  useEffect(() => {
    return trackSignal(get, setV)
  }, emptyArray)
  return v
}
