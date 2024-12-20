import { useCallback, useEffect, useRef } from "react"
import { emptyArray } from "wy-helper"

function useBuildGet<T extends (...vs: any[]) => any>(get: React.RefObject<T>) {
  return useCallback<T>(function (...vs) {
    return get.current!(...vs)
  } as T, emptyArray)
}

export function useEffectEvent<T extends (...vs: any[]) => any>(fun: T): T {
  const value = useRef<T>()
  useEffect(() => {
    value.current = fun
  })
  return useBuildGet(value as any)
}

/**
 * 
 * 只是对应单个函数,如果对应多个函数,就是Map,需要直接useRefConst
 * @param fun 
 * @returns 
 */
export function useEvent<T extends (...vs: any[]) => any>(fun: T): T {
  const ref = useRef(fun)
  useEffect(() => {
    ref.current = fun
  })
  return useCallback<T>(function (...vs) {
    return ref.current(...vs)
  } as T, emptyArray)
}