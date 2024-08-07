import * as React from 'react';
import { SetValue } from 'wy-helper';

export type RefCallback<T> = (newValue: T | null) => void;
export type RefObject<T> = React.MutableRefObject<T | null>;

export type DefinedReactRef<T> = RefCallback<T> | RefObject<T>;
export type ReactRef<T> = DefinedReactRef<T> | null;

export function assignRef<T>(ref: ReactRef<T>, value: T | null): ReactRef<T> {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }

  return ref;
}


export function mergeRefs<T>(refs: ReactRef<T>[]): SetValue<T | null> {
  return function (v) {
    refs.forEach(ref => assignRef(ref, v))
  }
}