import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useAlaways } from "./useAlaways";
import { quote } from "./util";
import { useRefState } from "./useRefState";

export type NotifyHandler = () => void;

type EventHandler<T> = (v: T) => void;
export interface VirtualEventCenter<T> {
  subscribe(notify: EventHandler<T>): () => void;
}
type Subscriber<T> = (v: EventHandler<T>) => () => void;
const emptyFun = () => { };
export function eventCenter<T>() {
  const pool = new Set<EventHandler<T>>();
  return {
    poolSize() {
      return pool.size
    },
    subscribe(notify: EventHandler<T>) {
      if (pool.has(notify)) {
        return emptyFun;
      }
      pool.add(notify);
      return function () {
        pool.delete(notify);
      };
    },
    notify(v: T) {
      pool.forEach((notify) => notify(v));
    },
  };
}
function toReduceState<T>(set: (v: T) => void, get: () => T) {
  return function (v: T | ((prev: T) => T)): T {
    if (typeof v == "function") {
      const newV = (v as any)(get()) as T;
      set(newV);
      return newV;
    } else {
      set(v);
      return v;
    }
  };
}
export type ReduceState<T> = React.Dispatch<React.SetStateAction<T>>;
export type BReduceState<T> = (a: React.SetStateAction<T>) => T;
export interface ValueCenter<T> {
  get(): T;
  poolSize(): number
  set(v: T): void;
  subscribe: Subscriber<T>;
}
export function valueCenterOf<T>(value: T): ValueCenter<T> {
  const { subscribe, notify, poolSize } = eventCenter<T>();
  return {
    get() {
      return value
    },
    set(v) {
      value = v
      notify(v)
    },
    poolSize,
    subscribe,
  };
}
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
 * add this hooks so can render current component
 * @param store
 */
/**
 * 
 * @param store 
 * @param arg 只能初始化,中间不可以改变,即使改变,也是跟随的
 */
export function useStoreTriggerRender<T, M>(store: ValueCenter<T>, arg: {
  filter(a: T): M,
  onBind?(a: M): void
}): M
export function useStoreTriggerRender<T>(store: ValueCenter<T>, arg?: {
  filter?(a: T): T,
  onBind?(a: T): void
}): T
export function useStoreTriggerRender<T>(store: ValueCenter<T>): T {
  const arg = arguments[1]
  const filter = arg?.filter || quote
  const [state, setState] = useRefState(store.get(), filter)
  useEffect(function () {
    function setValue(v: T) {
      const newState = filter(v) as T
      setState(newState)
      return newState
    }
    const newValue = store.get() as T
    setValue(newValue)
    arg?.onBind?.(newValue)
    return store.subscribe(setState)
  }, [store])
  return state as T
}
/**
 * 取局部
 */
export type ValueWithEvent<T> = {
  state: T;
  get(): T;
  subscribe: Subscriber<any>;
};
