import { useRef } from "react";

export function useRefConst<T>(fun: () => T) {
  return useRefFun(fun).current
}

export function useRefConstWith<T>(v: T) {
  return useRef(v).current
}


export function useRefFun<T>(fun: () => T) {
  const ref = useRef<T>()
  if (!ref.current) {
    ref.current = fun()
  }
  return ref as React.MutableRefObject<T>
}