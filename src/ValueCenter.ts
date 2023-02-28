import { useEffect, useState, useCallback, useRef, useMemo } from "react";

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
  set: ReduceState<T>;
  subscribe: Subscriber<T>;
}
export function valueCenterOf<T>(value: T): ValueCenter<T> {
  const { subscribe, notify } = eventCenter<T>();
  function get() {
    return value;
  }
  const set = toReduceState((v) => {
    value = v;
    notify(v);
  }, get);
  return {
    get,
    set,
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
/**值通知者*/
// export interface VirtualValueNotify<T>{
//   eventCenter: VirtualEventCenter<T>
//   get(): T
// }

// export class ValueCenter<T> implements VirtualValueCenter<T>{
//   private constructor(
//     private value: T,
//     public readonly eventCenter: VirtualEventCenter<T>
//   ) {
//     this.eventCenter = this.realEventCenter
//   }
//   static of<T>(value: T, isChange: (a: T, b: T) => boolean = defaultDidChange) {
//     return new ValueCenter(value, isChange)
//   }
//   get() {
//     return this.value
//   }
//   set(value: T) {
//     if (this.isChange(this.value, value)) {
//       this.value = value
//       this.realEventCenter.notify(value)
//     }
//   }
// }

// type PartBuilder<PARENT, CHILD> = {
//   store: VirtualValueCenter<PARENT>
//   getChild: (s: PARENT) => CHILD,
//   buildParent: (s: PARENT, t: CHILD) => PARENT
// }

// export class ValueCenter<T>{
//   public readonly eventCenter = ValueCenter.of
//   constructor(
//     private didChange: (a: T, b: T) => boolean = defaultDidChange
//   ) { }
// }
// export class PartValueCenter<T> implements VirtualValueCenter<T>{
//   constructor(
//     private builder: PartBuilder<any, T>
//   ) {
//     const map = new Map()
//     const eventCenter: VirtualEventCenter<T> = {
//       add(notify) {
//         if (map.has(notify)) {
//           return false
//         } else {
//           const builderNotify = (e: any) => {
//             const sub = builder.getChild(e)
//             notify(sub)
//           }
//           map.set(notify, builderNotify)
//           builder.store.eventCenter.add(builderNotify)
//           return true
//         }
//       },
//       remove(notify) {
//         if (map.has(notify)) {
//           builder.store.eventCenter.remove(map.get(notify))
//           map.delete(notify)
//         }
//         return false
//       },
//       subscribe(notify) {
//         if (map.has(notify)) {
//           return () => { }
//         } else {
//           eventCenter.add(notify)
//           return () => {
//             eventCenter.remove(notify)
//           }
//         }
//       },
//     }
//     this.eventCenter = eventCenter
//   }
//   eventCenter: VirtualEventCenter<T>
//   get(): T {
//     return this.builder.getChild(this.builder.store.get())
//   }
//   set(v: T): void {
//     this.builder.store.set(this.builder.buildParent(this.builder.store.get(), v))
//   }
//   static of<PARENT, CHILD>(
//     store: VirtualValueCenter<PARENT>,
//     getChild: (s: PARENT) => CHILD,
//     buildParent: (s: PARENT, t: CHILD) => PARENT
//   ) {
//     return new PartValueCenter({ store, getChild, buildParent })
//   }
//   static objectOf<PARENT extends object, K extends keyof PARENT>(
//     store: VirtualValueCenter<PARENT>,
//     key: K,
//     callback?: (v: PARENT[K], parent: PARENT) => PARENT[K]
//   ) {
//     const arg: PartBuilder<PARENT, PARENT[K]> = {
//       store,
//       getChild(s) {
//         return s[key]
//       },
//       buildParent(s, t) {
//         return {
//           ...s,
//           [key]: callback ? callback(t, s) : t
//         }
//       },
//     }
//     return new PartValueCenter(arg)
//   }
// }

// export class ArrayPartValueCenter<T> implements VirtualEventCenter<T>{
//   constructor(
//     private store: VirtualEventCenter<T[]>,
//     private equal: (v: T) => boolean
//   ) { }
//   get(): T {
//     return this.store.get().find(this.equal)!
//   }
//   set(v: T): void {
//     const idx = this.store.get().findIndex(this.equal)
//     if (idx < 0) {
//       return
//     }
//     const vs = this.store.get().slice()
//     vs.splice(idx, 1, v)
//     this.store.set(vs)
//   }
//   clear() {
//     const idx = this.store.get().findIndex(this.equal)
//     if (idx < 0) {
//       return
//     }
//     const vs = this.store.get().slice()
//     vs.splice(idx, 1)
//     this.store.set(vs)
//   }
//   add(notify: NotifyHandler, call?: boolean | undefined): boolean {
//     return this.store.add(notify, call)
//   }
//   remove(notify: NotifyHandler): boolean {
//     return this.store.remove(notify)
//   }
//   subscribe(notify: NotifyHandler, call?: boolean | undefined): () => void {
//     return this.store.subscribe(notify, call)
//   }
// }
// export function useValueCenter<T>(): ValueCenter<T | undefined>
// export function useValueCenter<T>(init: () => T): ValueCenter<T>
// export function useValueCenter() {
//   const init = arguments[0]
//   return useMemo(() => ValueCenter.of(init?.()), [])
// }
/**
 * add this hooks so can render current component
 * @param store
 */

function defaultIsChange<T>(a: T, b: T) {
  return a != b;
}
type RefStateParam<T> = {
  /**是否改变 */
  isChange?(a: T, b: T): boolean;
  /**内容改变 */
  onChange?(v: T): void;
  /**任何调用 */
  onSet?(v: T): void;
};
type RefState<T> = [T, BReduceState<T>, () => T];
export function useRefState<T>(): RefState<T | undefined>;
export function useRefState<T>(
  init: T | (() => T),
  arg?: RefStateParam<T>
): RefState<T>;
export function useRefState<T>() {
  const [init, arg] = arguments;
  const [state, setState] = useState(init);
  const ref = useRef(state);
  const get = useCallback(() => ref.current, []);
  const set = useMemo(() => {
    return toReduceState<T>((value) => {
      const isChange = arg?.isChange || defaultIsChange;
      if (isChange(value, ref.current)) {
        ref.current = value;
        setState(value);
        //在内容生效后调用
        arg?.onChange?.(value);
      }
      //都需要在内容生效后调用
      arg?.onSet?.(value);
    }, get);
  }, [arg?.isChange, arg?.onChange, arg?.onSet]);
  return [state, set, get] as const;
}
export function useStoreTriggerRender<T>(
  store: ValueCenter<T>,
  arg?: RefStateParam<T>
) {
  const [state, setState] = useRefState<T>(store.get(), arg);
  useEffect(
    function () {
      const isChange = arg?.isChange || defaultIsChange;
      if (isChange(state, store.get())) {
        setState(store.get());
      }
      return store.subscribe(setState);
    },
    [store]
  );
  return state;
}

/**
 * 取局部
 */
export type ValueWithEvent<T> = {
  state: T;
  get(): T;
  subscribe: Subscriber<any>;
};
