import { AbortPromiseResult, buildPromiseResultSetData, emptyFun, emptyObject, FalseType, GetPromiseRequest, GetValue, hookAbortSignalPromise, RequestVersionPromiseFinally, SetValue, VersionPromiseResult } from "wy-helper";
import { useEvent } from "./useEvent";
import { useEffect, useMemo, useRef, useState } from "react";

export function useRenderPromise<T>(
  /**触发事件 */
  initFinally: SetValue<AbortPromiseResult<T>>,
  /**作为依赖,如果request发生改变,则触发依赖计算 */
  request?: GetPromiseRequest<T> | FalseType
) {
  const onFinally: SetValue<AbortPromiseResult<T>> = useEvent(function (data) {
    if (request == data.request) {
      //因为abort-signal自动控制了,所有中止后不会调用回来.
      initFinally(data)
    }
  })
  useEffect(() => {
    if (request) {
      const abortController = new AbortController()
      hookAbortSignalPromise(abortController.signal, request, onFinally)
      return abortController.abort.bind(abortController)
    }
  }, [request])
}

export function useCallbackPromiseState<T>(
  outRequest: GetPromiseRequest<T>,
  deps: readonly any[]
) {
  return useMemoPromiseState(() => outRequest, deps)
}



export function useMemoPromise<T>(
  request: GetPromiseRequest<T> | FalseType,
  {
    onSuccess = emptyFun,
    onError = emptyFun
  }: {
    onSuccess?(value: T): void
    onError?(err: any): void
  } = emptyObject
) {
  const [data, setData] = useState<AbortPromiseResult<T>>()
  useRenderPromise(function (data) {
    if (data.type == 'error') {
      onError?.(data.value)
    } else {
      onSuccess?.(data.value)
    }
    setData(data)
  }, request)
  return {
    data: request ? data : undefined,
    loading: data?.request != request,
    setData: buildPromiseResultSetData(setData),
  }
}



export function useMemoPromiseState<T>(
  outRequest: () => GetPromiseRequest<T> | FalseType,
  deps: readonly any[]
) {
  return useMemoPromise(useMemo(outRequest, deps))
}

export function useCallbackPromise<T>(arg: {
  onSuccess?(value: T): void
  onError?(err: any): void
  body: GetPromiseRequest<T>
}, deps: readonly any[]) {
  return useMemoPromise(useMemo(() => arg.body, deps), arg)
}