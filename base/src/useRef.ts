import { useMemo } from "react"
import { emptyArray } from "wy-helper"

/**
 * 比如signal使用
 * @param v 
 * @returns 
 */
export function useConst<T>(v: T) {
  return useMemo(() => v, emptyArray)
}
/**
 * 构造一次性
 * @param creater 
 * @param vs 
 * @returns 
 */
export function useConstFrom<F, Arg extends readonly any[] = readonly any[]>(creater: (...vs: Arg) => F, ...vs: Arg) {
  return useMemo(() => {
    return creater(...vs)
  }, emptyArray)
}
/**
 * 其实就是useCallback
 * @param v 
 * @param dep 
 * @returns 
 */
export function useConstDep<T>(v: T, dep?: any) {
  return useMemo(() => v, dep)
}

export function useRefFrom<F, Arg extends readonly any[] = readonly any[]>(creater: (...vs: Arg) => F, ...vs: Arg) {
  return useMemo(() => {
    return {
      current: creater(...vs)
    }
  }, emptyArray)
}