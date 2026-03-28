import { effectsRunInOrder, emptyArray, emptyMap, GetValue } from 'wy-helper';
import { EnvModel } from './EnvModel';
import { useEffect, useLayoutEffect, useState } from 'react';
import { StateHolder } from './StateHolder';
import { useConstFrom } from '../useRef';
import { useRefConst } from '../useRefConst';
export * from './context';
export * from './effect';
export * from './EnvModel';
export * from './memo';
export * from './renderForEach';
export * from './state';
function createStateHolder() {
  return new StateHolder(undefined, 0);
}
function createSet() {
  return new Set();
}
export function useStateFunction<T = void>(callback: GetValue<T>) {
  const stateHolder = useConstFrom(createStateHolder);
  const [rootState, setRootState] = useState(emptyMap);
  const cacheDeleteState = useRefConst(createSet);
  const env = new EnvModel(rootState, setRootState, cacheDeleteState);
  EnvModel.currentEnvModel = env;
  stateHolder.beginRun();
  const out = callback();
  stateHolder.endRun();
  EnvModel.currentEnvModel = undefined!;
  useEffect(() => {
    return function () {
      //最终销毁，其实只处理抽象树
      const env = new EnvModel(rootState, setRootState, cacheDeleteState);
      env.addDelete(stateHolder);
      env.commit();
      effectsRunInOrder(env.updateEffects);
      effectsRunInOrder(env.updateLayoutEffects);
    };
  }, emptyArray);
  useEffect(() => {
    env.commit();
    effectsRunInOrder(env.updateEffects);
  });
  useLayoutEffect(() => {
    effectsRunInOrder(env.updateLayoutEffects);
  });
  return out;
}
