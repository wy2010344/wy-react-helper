import { useMemo } from 'react';
import { emptyArray, ValueCenter, valueCenterOf } from 'wy-helper';

export function useValueCenter<T>(init: () => T): ValueCenter<T> {
  return useMemo(() => {
    return valueCenterOf(init());
  }, emptyArray);
}
export function useValueCenterWith<T>(): ValueCenter<T | undefined>;
export function useValueCenterWith<T>(v: T): ValueCenter<T>;
export function useValueCenterWith() {
  const v = arguments[0];
  return useValueCenter(() => v);
}
