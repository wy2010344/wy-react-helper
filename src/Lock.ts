import { useEffect, useRef } from "react";
import { ReadOnlyRef } from "./useAlaways";


/**
 * 版本锁
 * @param init 
 * @returns 
 */
export function useVersionLock(init = 0) {
  const ref = useRef(init)
  return [ref as ReadOnlyRef<number>, function () {
    return ++ref.current
  }] as const
}

/**
 * 如果不是第一次,会是false
 * @returns 
 */
export function useIsLaunchLock() {
  const ref = useRef(true)
  useEffect(() => {
    ref.current = false
  }, [])
  return ref.current
}