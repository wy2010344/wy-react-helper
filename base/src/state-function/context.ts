import { emptyArray } from 'wy-helper';
import { hookStateHoder, StateHolder } from './StateHolder';

export interface Context<T> {
  useProvider(v: T): void;

  useConsumer(): T;
}

export function createContext<T>(v: T): Context<T> {
  return new ContextFactory(v);
}

class ContextFactory<T> implements Context<T> {
  constructor(readonly out: T) {}

  useProvider(v: T): void {
    const holder = hookStateHoder();
    if (holder.firstTime) {
      holder.contexts = holder.contexts || [];
      holder.contexts.push({
        key: this,
        value: v,
      });
      holder.contextIndex = holder.contextIndex + 1;
    } else {
      const providers = holder.contexts;
      if (!providers) {
        throw new Error('原组件上不存在providers');
      }
      const index = holder.contextIndex;
      const provider = providers[index];
      if (!provider) {
        throw new Error('原组件上不存在provider');
      }
      holder.contextIndex = index + 1;
      if (provider.key != this) {
        throw new Error('原组件上provider不对应');
      }
      provider.value = v;
    }
  }

  private findProviderStateHoder(_holder: StateHolder) {
    let begin = _holder.contexts?.length || 0;
    let holder: StateHolder | undefined = _holder;
    while (holder) {
      const providers = holder.contexts || emptyArray;
      for (let i = begin - 1; i > -1; i--) {
        const provider = providers[i];
        if (provider.key == this) {
          return [holder, provider.value] as const;
        }
      }
      begin = holder.parentContextIndex;
      holder = holder.parent;
    }
  }
  useConsumer(): T {
    const holder = hookStateHoder();
    const provider = this.findProviderStateHoder(holder);
    let value = this.out;
    if (provider) {
      value = provider[1];
    }
    return value;
  }
}
