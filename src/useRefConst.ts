import { useRef } from "react";

export function useRefConst<T>(fun: () => T) {
  const ref = useRef<T>()
  if (!ref.current) {
    ref.current = fun()
  }
  return ref.current
}

export function useRefConstFrom<T>(v: T) {
  return useRef(v).current
}