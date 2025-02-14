import { buildPromiseResultSetData, FalseType, GetPromiseRequest, GetValue, hookAbortSignalPromise, RequestPromiseFinally, RequestPromiseResult, RequestVersionPromiseFinally, RequestVersionPromiseReulst } from "wy-helper";
import { useEvent } from "./useEvent";
import { useEffect, useMemo, useRef, useState } from "react";

export function useRenderPromise<T>(
  /**触发事件 */
  initFinally: RequestPromiseFinally<T>,
  /**作为依赖,如果request发生改变,则触发依赖计算 */
  request?: GetPromiseRequest<T> | FalseType
) {
  const onFinally: RequestPromiseFinally<T> = useEvent(function (data) {
    if (request == data.request) {
      //因为abort-signal自动控制了,所有中止后不会调用回来.
      initFinally(data)
    }
  })
  useEffect(() => {
    if (request) {
      const abortController = new AbortController()
      hookAbortSignalPromise(abortController.signal, request, value => {
        const v = value as RequestPromiseResult<T>
        v.request = request
        onFinally(v)
      })
      return abortController.abort.bind(abortController)
    }
  }, [request])
}
export function useRenderVersionPromise<T>(
  /**触发事件 */
  initFinally: RequestVersionPromiseFinally<T>,
  /**作为依赖,如果request发生改变,则触发依赖计算 */
  request?: GetPromiseRequest<T> | FalseType
) {
  const ref = useRef(1)
  const version = useMemo(() => {
    return ref.current++
  }, [request])
  useRenderPromise(data => {
    const d = data as RequestVersionPromiseReulst<T>
    d.version = version
    initFinally(d)
  }, request)
  return version
}


export function useMemoPromiseState<T>(
  outRequest: () => GetPromiseRequest<T> | FalseType,
  deps: readonly any[]
) {
  return useMemoPromise({ body: outRequest }, deps)
}

export function useCallbackPromiseState<T>(
  outRequest: GetPromiseRequest<T>,
  deps: readonly any[]
) {
  return useMemoPromiseState(() => outRequest, deps)
}


export function useMemoPromise<T>({
  onSuccess,
  onError,
  body
}: {
  onSuccess?(value: T): void
  onError?(err: any): void
  body: GetValue<GetPromiseRequest<T> | FalseType>
}, deps: readonly any[]) {
  const request = useMemo(() => body(), deps)
  const [data, setData] = useState<RequestPromiseResult<T>>()
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


export function useCallbackPromise<T>(arg: {
  onSuccess?(value: T): void
  onError?(err: any): void
  body: GetPromiseRequest<T>
}, deps: readonly any[]) {
  return useMemoPromise({
    ...arg,
    body() {
      return arg.body
    }
  }, deps)
}