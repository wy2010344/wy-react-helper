import React, { DependencyList, EffectCallback, useEffect } from 'react';
import { arrayFunToOneOrEmpty, EmptyFun, FalseType } from 'wy-helper';

export function UseEffect({
  effect,
  deps,
}: {
  effect: EffectCallback;
  deps?: DependencyList;
}) {
  useEffect(effect, deps);
  return <></>;
}
let globalVS: ((e: any) => void)[] | FalseType = undefined;
export function addEffectDestroy(fun: (e: EmptyFun) => void) {
  if (globalVS) {
    globalVS.push(fun);
  } else {
    throw new Error('必须在effect里执行');
  }
}
export function useHookEffect(effect: EmptyFun, deps?: DependencyList) {
  useEffect(() => {
    const list: EmptyFun[] = [];
    globalVS = list;
    effect();
    globalVS = undefined;
    return arrayFunToOneOrEmpty(list);
  }, deps);
}
