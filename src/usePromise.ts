import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useChange } from "./useChange"
import { useEvent } from "./useEvent"
import { useVersionLock } from "./Lock"
import { ReduceState } from "./ValueCenter"

export type PromiseResult<T> = {
  type: "success",
  value: T
} | {
  type: "error",
  value: any
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
type GetPromiseRequest<T> = (signal?: AbortSignal, ...vs: any[]) => Promise<T>;
export type GetPromise<T> = {
  version: number;
  request: GetPromiseRequest<T>;
};
type GetPromiseResult<T> = PromiseResult<T> & {
  getPromise: GetPromise<T>;
};
type OnFinally<T> = (data: GetPromiseResult<T>, ...vs: any[]) => void;
function createAbortController() {
  if ("AbortController" in globalThis) {
    const signal = new AbortController();
    return {
      signal: signal.signal,
      cancel() {
        signal.abort();
      },
    };
  }
  return {
    signal: undefined,
    cancel() { },
  };
}
export type FalseType = false | undefined | null | 0 | "" | void;
function usePromise<T>(
  getPromise: GetPromise<T> | FalseType,
  initOnFinally: OnFinally<T>
) {
  const onFinally = useEvent(function (data: GetPromiseResult<T>) {
    if (getPromise == data.getPromise) {
      initOnFinally(data);
    }
  });
  useEffect(() => {
    if (getPromise) {
      const signal = createAbortController();
      getPromise
        .request(signal.signal)
        .then((data) => {
          onFinally({ type: "success", value: data, getPromise });
        })
        .catch((err) => {
          onFinally({ type: "error", value: err, getPromise });
        });
      return signal.cancel;
    }
  }, [getPromise, onFinally]);
}

type OutPromiseOrFalse<T> = GetPromiseRequest<T> | FalseType;
export function useMemoPromiseCall<T, Deps extends readonly any[]>(
  onFinally: OnFinally<T>,
  effect: () => OutPromiseOrFalse<T>,
  deps: Deps
) {
  const versonRef = useRef(0);
  const getPromise = useMemo<GetPromise<T> | FalseType>(() => {
    const out = effect();
    if (out) {
      const version = versonRef.current++;
      return {
        version,
        request: out
      };
    }
    return out as FalseType;
  }, deps);
  usePromise(getPromise, onFinally);
  return getPromise;
}
export function useCallbackPromiseCall<T, Deps extends readonly any[]>(
  callback: GetPromiseRequest<T>,
  onFinally: OnFinally<T>,
  deps: Deps
) {
  const versonRef = useRef(0);
  const getPromise = useMemo(() => {
    const version = versonRef.current++;
    return {
      version,
      request: callback,
    };
  }, deps);
  usePromise(getPromise, onFinally);
  return getPromise;
}

/**
 * 内部状态似乎不应该允许修改
 * 后面可以使用memo合并差异项
 * @param param0
 * @param deps
 * @returns [生效的数据,是否在loading]
 */

export function useBaseMemoPromiseState<T, Deps extends readonly any[] = any[]>(
  onFinally: undefined | OnFinally<T>,
  effect: () => OutPromiseOrFalse<T>,
  deps: Deps
) {
  const [data, updateData] = useState<
    PromiseResult<T> & {
      getPromise: GetPromise<T>;
    }
  >();
  const hasPromise = useMemoPromiseCall(
    (data) => {
      onFinally?.(data);
      updateData(data);
    },
    effect,
    deps
  );
  const outData = hasPromise ? data : undefined;
  return {
    data: outData,
    loading: outData?.getPromise != hasPromise,
    getPromise: hasPromise,
    setData: buildSetData(updateData),
  };
}
export function useMemoPromiseState<T, Deps extends readonly any[]>(
  effect: () => OutPromiseOrFalse<T>,
  deps: Deps
) {
  return useBaseMemoPromiseState(undefined, effect, deps)
}


function buildSetData<T>(
  updateData: ReduceState<
    | (PromiseResult<T> & {
      getPromise: GetPromise<T>;
    })
    | undefined
  >
) {
  return function setData(fun: T | ((v: T) => T)) {
    updateData((old) => {
      if (old?.type == "success") {
        return {
          ...old,
          value: typeof fun == "function" ? (fun as any)(old.value) : fun,
        };
      }
      return old;
    });
  };
}
export function useBaseCallbackPromiseState<
  T,
  Deps extends readonly any[] = any[]
>(
  onFinally: undefined | OnFinally<T>,
  effect: GetPromiseRequest<T>,
  deps: Deps) {
  const [data, updateData] = useState<
    PromiseResult<T> & {
      getPromise: GetPromise<T>;
    }
  >();
  const hasPromise = useCallbackPromiseCall(
    effect,
    (data) => {
      onFinally?.(data);
      updateData(data);
    },
    deps
  );
  return {
    data,
    loading: data?.getPromise != hasPromise,
    getPromise: hasPromise,
    setData: buildSetData(updateData),
  };
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

type MutationResult<Res> = PromiseResult<Res> & {
  version: number
}

/**
 * 阻塞的请求,并带有状态
 * @param effect 
 * @returns 
 */
export function useMutationState<Req extends any[], Res>(effect: (...vs: Req) => Promise<Res>) {
  const [versionLock, updateVersionLock] = useVersionLock()
  const [data, updateData] = useChange<MutationResult<Res>>()
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

/**
 * 串行的请求
 * @param callback 
 * @param effect 
 * @returns 
 */
export function useSerialRequest<Req extends any[], Res>(
  callback: (...vs: Req) => Promise<Res>,
  effect: (res: PromiseResult<Res>) => void
) {
  const [versionLock, updateVersion] = useVersionLock();
  return [function (...vs: Req) {
    const version = updateVersion();
    callback(...vs)
      .then((data) => {
        if (version == versionLock.current) {
          effect({
            type: "success",
            value: data,
          });
        }
      })
      .catch((err) => {
        if (version == versionLock.current) {
          effect({
            type: "error",
            value: err,
          });
        }
      });
  }, updateVersion] as const
}


/**
 * 将上面的usePromise转换成promise
 * @param getPromise
 * @returns
 */
export function useRefreshPromise(
  getPromise: GetPromise<any>
) {
  const refreshFlag = useRef<{
    getPromise: GetPromise<any>;
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
    notify(getPromise: GetPromise<any>) {
      if (refreshFlag.current) {
        // console.log('ver-', getPromise.version, refreshFlag.current.getPromise.version)
        if (getPromise.version > refreshFlag.current.getPromise.version) {
          refreshFlag.current.notify();
        }
      }
    },
  };
}
