import { effectsAddLevel, EmptyFun, run, SetStateAction } from 'wy-helper';
import { IEnvModel, RenderStore } from 'wy-helper/state-function';
import { StateHolder } from './StateHolder';
import { Dispatch } from 'react';

/**
 * 每次render新建一个。。。
 */
export class EnvModel implements IEnvModel<StateHolder> {
  constructor(
    readonly rootState: Map<any, any>,
    readonly setRootState: Dispatch<SetStateAction<Map<any, any>>>,
    readonly cacheDeleteSet: Set<any>
  ) {}
  static currentEnvModel: EnvModel;
  private deletions: StateHolder[] = [];

  addDelete(fiber: StateHolder): void {
    this.deletions.push(fiber);
  }
  private changes: EmptyFun[] = [];
  commitChange(fun: EmptyFun): void {
    this.changes.push(fun);
  }

  updateEffects = new Map<number, EmptyFun[]>();
  updateLayoutEffects = new Map<number, EmptyFun[]>();
  updateEffect = (level: number, layout: boolean, fun: EmptyFun) => {
    effectsAddLevel(
      layout ? this.updateLayoutEffects : this.updateEffects,
      level,
      fun
    );
  };

  commit() {
    this.changes.forEach(run);
    this.deletions.forEach(fiber => notifyDel(fiber, this));
  }
}

export function hookCurrentEnvModel() {
  return EnvModel.currentEnvModel;
}

function notifyDel(fiber: StateHolder, envModel: EnvModel) {
  destroyFiber(fiber, envModel);
  fiber.children?.forEach(child => {
    notifyDel(child, envModel);
  });
}
function destroyFiber(fiber: StateHolder, envModel: EnvModel) {
  fiber.destroyed = true;
  const effects = fiber.effects;
  if (effects) {
    effects.forEach(effect => {
      const state = effect.get(envModel);
      envModel.updateEffect(state.level, state.layout, function () {
        const destroy = state.destroy;
        if (destroy) {
          destroy({
            isDestroy: true,
            value: state.value,
            beforeIsInit: state.isInit,
            beforeTrigger: state.deps,
          });
        }
      });
    });
  }
}
