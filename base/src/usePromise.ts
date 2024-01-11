import React, { useEffect, useMemo, useRef, useState } from "react"
import { useChange } from "./useChange"
import { useEvent } from "./useEvent"
import { useVersionLock } from "./Lock"
import { EmptyFun, createEmptyArray, emptyFun, ReduceState, PromiseResult, buildSerialRequestSingle, createAbortController, GetPromiseRequest, OnVersionPromiseFinally, VersionPromiseResult, PromiseResultSuccessValue, buildPromiseResultSetData, OutPromiseOrFalse } from "wy-helper"
import { useRefConst } from "./useRefConst"

export function createAndFlushAbortController(ref: React.MutableRefObject<(() => void) | undefined>) {
  const controller = createAbortController()
  const last = ref.current
  if (last) {
    last()
  }
  ref.current = controller.cancel
  return controller.signal
}
export function useMemoPromiseCall<T, Deps extends readonly any[]>(
  initOnFinally: OnVersionPromiseFinally<T>,
  effect: () => OutPromiseOrFalse<T>,
  deps: Deps
) {
  const versonRef = useRef(0);
  const mout = useMemo(() => {
    return {
      version: versonRef.current++,
      request: effect()
    }
  }, deps)
  const {
    version,
    request
  } = mout
  const onFinally = useEvent(function (data: VersionPromiseResult<T>) {
    if (version == data.version) {
      initOnFinally(data)
    }
  })
  useEffect(() => {
    if (request) {
      const signal = createAbortController();
      request(signal.signal).then(data => {
        onFinally({ type: "success", value: data, version })
      }).catch(err => {
        onFinally({ type: "error", value: err, version })
      })
      return signal.cancel
    }
  }, [version, request, onFinally])
  return mout
}
export function useCallbackPromiseCall<T, Deps extends readonly any[]>(
  callback: GetPromiseRequest<T>,
  onFinally: OnVersionPromiseFinally<T>,
  deps: Deps
) {
  return useMemoPromiseCall(onFinally, () => callback, deps)
}

/**
 * 内部状态似乎不应该允许修改
 * 后面可以使用memo合并差异项
 * @param param0
 * @param deps
 * @returns [生效的数据,是否在loading]
 */

export function useBaseMemoPromiseState<T, Deps extends readonly any[] = any[]>(
  onFinally: undefined | OnVersionPromiseFinally<T>,
  effect: () => OutPromiseOrFalse<T>,
  deps: Deps
) {
  const [data, updateData] = useState<VersionPromiseResult<T>>();
  const { version, request } = useMemoPromiseCall(
    (data) => {
      onFinally?.(data);
      updateData(data);
    },
    effect,
    deps
  );
  const outData = request ? data : undefined;
  return {
    data: outData,
    version,
    loading: outData?.version != version,
    setData: buildPromiseResultSetData(updateData),
  };
}
export function useMemoPromiseState<T, Deps extends readonly any[]>(
  effect: () => OutPromiseOrFalse<T>,
  deps: Deps
) {
  return useBaseMemoPromiseState(undefined, effect, deps)
}

export function useBaseCallbackPromiseState<
  T,
  Deps extends readonly any[] = any[]
>(
  onFinally: undefined | OnVersionPromiseFinally<T>,
  effect: GetPromiseRequest<T>,
  deps: Deps
) {
  return useBaseMemoPromiseState(onFinally, () => effect, deps)
}
/**
 * 常用的根据依赖返回异步状态
 * @param effect 
 * @param deps 
 * @returns 
 */
export function useCallbackPromiseState<T, Deps extends readonly any[]>(
  effect: GetPromiseRequest<T>,
  deps: Deps
) {
  return useBaseCallbackPromiseState(undefined, effect, deps)
}
/**
 * 阻塞的请求
 * @param effect 
 * @returns 
 */
export function useMutation<Req extends any[], Res>(effect: (...vs: Req) => Promise<Res>) {
  const boolLock = useRef(false)
  return function (...vs: Req) {
    if (boolLock.current) {
      return
    }
    boolLock.current = true
    return effect(...vs).finally(() => {
      boolLock.current = false
    })
  }
}
/**
 * 阻塞请求,带有加载状态
 * @param effect 
 * @returns 
 */
export function useMutationWithLoading<Req extends any[], Res>(effect: (...vs: Req) => Promise<Res>) {
  const [loading, setLoading] = useState(false)
  const request = useMutation(effect)
  return [function (...vs: Req) {
    const out = request(...vs)
    if (out) {
      setLoading(true)
      return out.finally(() => {
        setLoading(false)
      })
    }
  }, loading] as const
}

/**
 * 阻塞的请求,并带有状态
 * @param effect 
 * @returns 
 */
export function useMutationState<Req extends any[], Res>(effect: (...vs: Req) => Promise<Res>) {
  const [versionLock, updateVersionLock] = useVersionLock()
  const [data, updateData] = useChange<VersionPromiseResult<Res>>()
  return [useEvent(function (...vs: Req) {
    if ((data?.version || 0) != versionLock.current) {
      return
    }
    const version = updateVersionLock()
    return effect(...vs).then(res => {
      updateData({ type: "success", value: res, version })
    }).catch(err => {
      updateData({ type: "error", value: err, version })
    })
  }), data] as const
}


export function useSerialRequestSingle<Req extends any[], Res>(
  callback: (...vs: Req) => Promise<Res>,
  effect: (res: PromiseResult<Res>) => void = emptyFun
) {
  const cacheList = useRefConst<Req[]>(createEmptyArray)
  return buildSerialRequestSingle(callback, effect, cacheList)
}
/**
 * 串行的请求
 * @param callback 
 * @param effect 
 * @returns 
 */
export function useSerialRequest<Req extends any[], Res>(
  callback: (vs: Req, version: number, signal?: AbortSignal) => Promise<Res>,
  effect: (res: VersionPromiseResult<Res>, version: number) => void
) {
  const lastCancelRef = useRef<EmptyFun | undefined>(undefined)
  const [versionLock, updateVersion] = useVersionLock();
  return [
    function (...vs: Req) {
      const version = updateVersion();
      return callback(vs, version, createAndFlushAbortController(lastCancelRef))
        .then((data) => {
          if (version == versionLock.current) {
            effect({
              type: "success",
              value: data,
              version
            }, version);
            return true;
          }
        })
        .catch((err) => {
          if (version == versionLock.current) {
            effect({
              type: "error",
              value: err,
              version
            }, version);
            return false;
          }
        });
    },
    updateVersion,
  ] as const;
}
/**
 * 可重载的异步请求,封闭一个loading
 * @param callback
 * @param effect
 * @returns
 */
export function useSerialRequestLoading<Req extends any[], Res>(
  callback: (vs: Req, signal?: AbortSignal) => Promise<Res>,
  effect: (res: VersionPromiseResult<Res>) => void
) {
  const [reqVersion, setReqVersion] = useState(0);
  const [resVersion, setResVersion] = useState(0);
  const [request, updateVersion] = useSerialRequest(
    function (args: Req, v, signal) {
      setReqVersion(v);
      return callback(args, signal);
    },
    function (res, v) {
      setResVersion(v);
      return effect(res);
    }
  );
  return [request, reqVersion != resVersion, updateVersion] as const;
}


function buildRefreshPromise<T>(shouldNotify: (a: T, old: T) => boolean) {
  return function useRefreshPromise(getPromise: T) {
    const refreshFlag = useRef<{
      getPromise: T;
      notify(): void;
    }>();
    return {
      request: useEvent(function (updateVersion: () => void) {
        return new Promise((resolve) => {
          updateVersion();
          refreshFlag.current = {
            getPromise,
            notify() {
              refreshFlag.current = undefined;
              resolve(null);
            },
          };
        });
      }),
      notify(getPromise: T) {
        if (refreshFlag.current) {
          if (shouldNotify(getPromise, refreshFlag.current.getPromise)) {
            refreshFlag.current.notify();
          }
        }
      },
    };
  }
}
/**
 * 如果是仅用数字的VersionPromiseResult
 */
export const useVersionRefreshPromise = buildRefreshPromise<number>(function (a, b) {
  return a > b
})