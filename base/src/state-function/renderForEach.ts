import { createRenderForEach, MemoEvent } from 'wy-helper/state-function';
import { hookStateHoder, StateHolder } from './StateHolder';
import {
  alawaysFalse,
  GetValue,
  ReadArray,
  storeRef,
  StoreRef,
} from 'wy-helper';
import { useBaseMemo } from './memo';
import { hookCurrentEnvModel } from './EnvModel';

export const useForEach = createRenderForEach(
  hookStateHoder,
  hookCurrentEnvModel,
  StateHolder.from,
  function <M>(createMap: GetValue<M>): StoreRef<M> {
    return useBaseMemo(alawaysFalse, createMapRef, createMap);
  }
);

function createMapRef<M>(e: MemoEvent<StoreRef<M>, GetValue<M>>) {
  return storeRef(e.trigger());
}

export function useArray<T>(
  list: ReadArray<T>,
  render: (row: T, index: number) => void
) {
  useForEach(function (callback) {
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      callback(row, function () {
        render(row, i);
      });
    }
  });
}

export function useArrayKey<T>(
  list: ReadArray<T>,
  getKey: (v: T) => any,
  render: (row: T, key: number, index: number) => void
) {
  useForEach(function (callback) {
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      const key = getKey(row);
      callback(key, function () {
        render(row, key, i);
      });
    }
  });
}

export function useCondition<T, V = void>(
  condition: T,
  renderCondition: (condition: T) => V
) {
  return useForEach<T, V, V>(function (callback) {
    return callback(condition, renderCondition);
  });
}
