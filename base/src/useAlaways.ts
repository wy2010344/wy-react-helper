import { useRef } from 'react';

export type ReadOnlyRef<T> = {
  readonly current: T;
};
export function useAlaways<T>(v: T) {
  const ref = useRef(v);
  ref.current = v;
  return ref as ReadOnlyRef<T>;
}
