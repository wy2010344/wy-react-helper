import { HookEffect } from './effect';
import { HookMemo, IStateHolder, RenderStore } from 'wy-helper/state-function';
import { Context } from './context';

export class StateHolder implements IStateHolder {
  static currentHolder?: StateHolder;
  constructor(
    readonly parent: StateHolder | undefined,
    readonly parentContextIndex: number
  ) {}
  static from(parent: StateHolder) {
    return new StateHolder(parent, parent.contextIndex);
  }
  memoIndex = 0;

  contexts?: {
    key: Context<any>;
    value: any;
  }[];
  contextIndex = 0;

  children?: Set<StateHolder> | undefined;
  firstTime = true;

  effects?: RenderStore<HookEffect<any, any>>[];
  effectIndex = 0;

  destroyed?: boolean;

  beginRun(): void {
    StateHolder.currentHolder = this;
    this.contextIndex = 0;
    this.effectIndex = 0;
    this.memoIndex = 0;
  }
  endRun(): void {
    this.firstTime = false;
    StateHolder.currentHolder = this.parent;
  }
}

export function hookStateHoder() {
  return StateHolder.currentHolder!;
}
