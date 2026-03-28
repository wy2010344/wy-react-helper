import { arrayNotEqualOrOne, EmptyFun } from 'wy-helper';
import { hookStateHoder, StateHolder } from './StateHolder';
import { hookCurrentEnvModel } from './EnvModel';
import { RenderStore } from 'wy-helper/state-function';

export type HookEffect<V, D> = {
  layout: boolean;
  level: number;
  shouldChange(a: D, b: D): any;
  deps: D;
  value?: V;
  isInit: boolean;
  destroy?: void | ((newDeps: EffectDestroyEvent<V, D>) => void);
};

export type LayoutEffect = (fun: EmptyFun) => void;

export type EffectDestroyEvent<V, T> =
  | {
      isDestroy: false;
      trigger: T;
      value: V;
      beforeIsInit: boolean;
      beforeTrigger: T;
    }
  | {
      isDestroy: true;
      trigger?: never;
      value: V;
      beforeIsInit: boolean;
      beforeTrigger: T;
    };
export type EffectDestroy<V, T> =
  | void
  | ((e: EffectDestroyEvent<V, T>) => void);
export type EffectResult<V, T> =
  | [V, EffectDestroy<V, T>]
  | EffectDestroy<V, T>
  | void;
export type EffectEvent<V, T> =
  | {
      trigger: T;
      isInit: true;
      value?: never;
      beforeTrigger?: never;
    }
  | {
      trigger: T;
      isInit: false;
      value: V;
      beforeTrigger: T;
    };

export function useLevelEffect<V, T>(
  level: number,
  layout: boolean,
  /**可以像memo一样放在外面..*/
  shouldChange: (a: T, b: T) => any,
  effect: (e: EffectEvent<V, T>) => EffectResult<V, T>,
  deps: T
): void {
  const holder = hookStateHoder();
  const envModel = hookCurrentEnvModel();
  if (holder.firstTime) {
    //新增
    const hookEffects = holder.effects || [];
    holder.effects = hookEffects;
    const state: HookEffect<V, T> = {
      layout,
      level,
      deps,
      isInit: true,
      shouldChange,
    };
    const hookEffect = new RenderStore(state);
    hookEffects.push(hookEffect);
    envModel.updateEffect(level, layout, () => {
      const out = effect({
        beforeTrigger: undefined,
        isInit: true,
        trigger: deps,
      });
      if (Array.isArray(out)) {
        [state.value, state.destroy] = out;
      } else {
        state.destroy = out;
      }
    });
  } else {
    const hookEffects = holder.effects;
    if (!hookEffects) {
      throw new Error('原组件上不存在hookEffects');
    }
    const index = holder.effectIndex;
    const hookEffect = hookEffects[index];
    if (!hookEffect) {
      throw new Error('出现了更多的effect');
    }
    const state = hookEffect.get(envModel);
    holder.effectIndex = index + 1;
    if (state.shouldChange(state.deps, deps)) {
      const newState: HookEffect<V, T> = {
        layout,
        level,
        deps,
        isInit: false,
        shouldChange,
      };
      hookEffect.set(envModel, newState);
      envModel.updateEffect(level, layout, () => {
        if (state.destroy) {
          state.destroy({
            isDestroy: false,
            trigger: deps,
            value: state.value,
            beforeIsInit: state.isInit,
            beforeTrigger: state.deps,
          });
        }
        const out = effect({
          beforeTrigger: state.deps,
          isInit: false,
          value: state.value,
          trigger: deps,
        });
        if (Array.isArray(out)) {
          [newState.value, newState.destroy] = out;
        } else {
          newState.destroy = out;
        }
      });
    }
  }
}
type EffectSelf = (
  e: EffectEvent<undefined, EffectSelf>
) => EffectDestroy<undefined, EffectSelf>;
export function buildUseEffect(level: number, layout: boolean) {
  function useEffect<T>(
    effect: (e: EffectEvent<undefined, T>) => EffectDestroy<undefined, T>,
    deps: T
  ): void;
  function useEffect(effect: EffectSelf): void;
  function useEffect(effect: any) {
    const deps = arguments.length == 1 ? effect : arguments[1];
    return useLevelEffect(level, layout, arrayNotEqualOrOne, effect, deps);
  }
  return useEffect;
}

export const useEffect = buildUseEffect(0, false);
export const useLayoutEffect = buildUseEffect(0, true);
