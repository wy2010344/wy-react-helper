import { useMemo, useRef } from 'react';
import { emptyArray, storeRef } from 'wy-helper';
import React from 'react';
export function useRefConst<T>(fun: () => T) {
  return useRefFun(fun).current;
}

export function useRefConstWith<T>(v: T) {
  return useRef(v).current;
}

export function useRefFun<T>(fun: () => T) {
  const ref = useRef<T>();
  if (!ref.current) {
    ref.current = fun();
  }
  return ref as React.MutableRefObject<T>;
}

export function useAtomFun<T>(fun: () => T) {
  return useMemo(() => {
    return storeRef(fun());
  }, emptyArray);
}

export function useAtom<T>(fun: T) {
  return useMemo(() => {
    return storeRef(fun);
  }, emptyArray);
}
