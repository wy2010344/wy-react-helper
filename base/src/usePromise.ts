import { useEffect, useRef, useState } from 'react'
import { useVersionLock } from './Lock'
import {
  createEmptyArray,
  emptyFun,
  PromiseResult,
  buildSerialRequestSingle,
  VersionPromiseResult,
  hookAbortSignalPromise,
  getOutResolvePromise,
  SetValue,
  emptyArray,
} from 'wy-helper'
import { useRefConst } from './useRefConst'
/**
 * 阻塞的请求,即如果正在进行,请求不进去
 * @param effect
 * @returns
 */
export function useMutation<Req extends any[], Res>(
  effect: (...vs: Req) => Promise<Res>
) {
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
export function useMutationWithLoading<Req extends any[], Res>(
  effect: (...vs: Req) => Promise<Res>
) {
  const [loading, setLoading] = useState(false)
  const request = useMutation(effect)
  return [
    function (...vs: Req) {
      const out = request(...vs)
      if (out) {
        setLoading(true)
        return out.finally(() => {
          setLoading(false)
        })
      }
    },
    loading,
  ] as const
}
/**
 * 阻塞的请求,中间的callback可能会丢弃掉.如果刚好完全处理完,会告知最后一次的effect
 * 主要是处理异步set方法,set是覆盖性的.
 * @param callback
 * @param effect
 * @returns
 */
export function useSerialRequestSingle<Req extends any[], Res>(
  callback: (...vs: Req) => Promise<Res>,
  effect: (res: PromiseResult<Res>) => void = emptyFun
) {
  const cacheList = useRefConst<Req[]>(createEmptyArray)
  return buildSerialRequestSingle(callback, effect, cacheList)
}
/**
 * 每次都会处理,主要是保证effect处理最后一次请求
 * @param callback
 * @param effect
 * @returns
 */
export function useLatestRequest<Req extends any[], Res>(
  callback: (vs: Req, version: number) => Promise<Res>,
  effect: (res: VersionPromiseResult<Res>, version: number) => void
) {
  const flushAbort = useRefConst(() => {
    let abortControler: AbortController | undefined = undefined
    let lastSetValue = emptyFun
    return {
      createSignal(setValue: SetValue<boolean>) {
        lastSetValue(false)
        abortControler?.abort()
        abortControler = new AbortController()
        lastSetValue = setValue
        return abortControler.signal
      },
      effect() {
        return function () {
          lastSetValue(false)
          abortControler?.abort()
        }
      },
    }
  })
  useEffect(flushAbort.effect, emptyArray)
  const [versionLock, updateVersion] = useVersionLock()
  return [
    function (...vs: Req) {
      const version = updateVersion()
      const [promise, resolve] = getOutResolvePromise<boolean>()
      hookAbortSignalPromise(
        flushAbort.createSignal(resolve),
        () => callback(vs, version),
        (value) => {
          if (version == versionLock.current) {
            const v = value as VersionPromiseResult<Res>
            v.version = version
            effect(v, version)
            resolve(true)
          } else {
            resolve(false)
          }
        }
      )
      return promise
    },
    updateVersion,
  ] as const
}
/**
 * 可重载的异步请求,封闭一个loading
 * @param callback
 * @param effect
 * @returns
 */
export function useLatestRequestLoading<Req extends any[], Res>(
  callback: (vs: Req) => Promise<Res>,
  effect: (res: VersionPromiseResult<Res>) => void
) {
  const [reqVersion, setReqVersion] = useState(0)
  const [resVersion, setResVersion] = useState(0)
  const [request, updateVersion] = useLatestRequest(
    function (args: Req, v) {
      setReqVersion(v)
      return callback(args)
    },
    function (res, v) {
      setResVersion(v)
      return effect(res)
    }
  )
  return [request, reqVersion != resVersion, updateVersion] as const
}

function buildRefreshPromise<T>(shouldNotify: (a: T, old: T) => boolean) {
  return function useRefreshPromise(getPromise: T) {
    const refreshFlag = useRef<{
      getPromise: T
      notify(): void
    }>()
    return {
      request(updateVersion: () => void) {
        return new Promise((resolve) => {
          updateVersion()
          refreshFlag.current = {
            getPromise,
            notify() {
              refreshFlag.current = undefined
              resolve(null)
            },
          }
        })
      },
      notify(getPromise: T) {
        if (refreshFlag.current) {
          if (shouldNotify(getPromise, refreshFlag.current.getPromise)) {
            refreshFlag.current.notify()
          }
        }
      },
    }
  }
}
/**
 * 如果是仅用数字的VersionPromiseResult
 */
export const useVersionRefreshPromise = buildRefreshPromise<number>(function (
  a,
  b
) {
  return a > b
})
