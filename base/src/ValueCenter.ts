import { useMemo } from "react";
import { Subscriber, ValueCenter, valueCenterOf } from "wy-helper";

export function useValueCenter<T>(init: () => T): ValueCenter<T> {
  return useMemo(() => {
    return valueCenterOf(init());
  }, []);
}
export function useValueCenterWith<T>(): ValueCenter<T | undefined>;
export function useValueCenterWith<T>(v: T): ValueCenter<T>;
export function useValueCenterWith() {
  const v = arguments[0];
  return useValueCenter(() => v);
}
/**
 * 取局部
 */
export type ValueWithEvent<T> = {
  state: T;
  get(): T;
  subscribe: Subscriber<any>;
};
