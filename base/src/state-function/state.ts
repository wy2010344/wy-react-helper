import { Dispatch } from 'react';
import { hookCurrentEnvModel } from './EnvModel';
import { emptyArray, SetStateAction } from 'wy-helper';
import { useMemo } from './memo';
import { useEffect } from './effect';

export function useState<T>(v: T) {
  const env = hookCurrentEnvModel();
  const defaultValue = useMemo(() => {
    const o = {
      value: v,
      set(e: SetStateAction<T>) {
        env.setRootState(old => {
          const newMap = new Map(old);
          env.cacheDeleteSet.forEach(old => {
            newMap.delete(old);
          });
          env.cacheDeleteSet.clear();
          newMap.set(
            o,
            typeof e == 'function' ? (e as any)(old.has(o) ? old.get(o) : v) : e
          );
          return newMap;
        });
      },
    };
    return o;
  }, emptyArray);
  useEffect(() => {
    return function () {
      env.cacheDeleteSet.add(defaultValue);
    };
  }, emptyArray);
  return [
    (env.rootState.has(defaultValue)
      ? env.rootState.get(defaultValue)
      : defaultValue.value) as T,
    defaultValue.set,
  ] as const;
}
