import React, { useEffect, JSX } from 'react';
import { Key } from 'react';
import { EmptyFun, emptyObject, objectFreeze, SetValue } from 'wy-helper';
import { useChange } from './useChange';

export function generateHook() {
  return function HookRender({ render }: { render: () => JSX.Element }) {
    return render();
  };
}
export const HookRender = generateHook();

let globalCtx: any[] = [];
function useCreate(ctx: any[]) {
  const oldCtx = globalCtx;
  globalCtx = ctx;
  return oldCtx;
}
export function useAdd(v: any) {
  globalCtx.push(v);
}
function useFinish(oldCtx: any[]) {
  globalCtx = oldCtx;
}

export function renderList(render: EmptyFun) {
  /* eslint-disable */
  const ctx: any[] = [];
  const old = useCreate(ctx);
  render();
  useFinish(old);
  return objectFreeze(ctx);
}

export function renderForEach(
  forEach: (callback: (key: Key, callback: EmptyFun) => void) => void
) {
  /* eslint-disable */
  useAdd(
    React.createElement(
      React.Fragment,
      emptyObject,
      renderList(function () {
        forEach(function (key, callback) {
          useAdd(
            React.createElement(React.Fragment, { key }, renderList(callback))
          );
        });
      })
    )
  );
}

export function Br({ render }: { render: EmptyFun }) {
  const ctx = renderList(render);
  return React.createElement(React.Fragment, emptyObject, ...ctx);
}

export function renderArray<T>(
  array: readonly T[],
  getKey: (v: T, i: number) => React.Key,
  render: (v: T, i: number, key: React.Key) => void
) {
  renderForEach(function (forEach) {
    for (let i = 0; i < array.length; i++) {
      const v = array[i];
      const key = getKey(v, i);
      forEach(key, () => {
        render(v, i, key);
      });
    }
  });
}

export function SyncFun({
  sync,
}: {
  sync: (set: SetValue<React.ReactNode>) => EmptyFun;
}) {
  const [v, setV] = useChange<React.ReactNode>();
  useEffect(() => {
    return sync(setV);
  }, [sync]);
  return v;
}
