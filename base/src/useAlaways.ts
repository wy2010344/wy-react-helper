import { useMemo, useRef } from "react";
import { emptyArray } from "wy-helper";

export type ReadOnlyRef<T> = {
  readonly current: T
}
export function useAlaways<T>(v: T) {
  const ref = useRef(v)
  ref.current = v
  return ref as ReadOnlyRef<T>
}



export function useConst<Arg extends readonly any[], F>(creater: (...vs: Arg) => F, ...vs: Arg) {
  const ref = useRef<F>()
  if (!ref.current) {
    ref.current = creater(...vs)
  }
  return ref.current
}