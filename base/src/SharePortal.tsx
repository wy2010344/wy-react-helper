import React, { useEffect, useMemo, JSX } from 'react';
import { useValueCenterWith } from './ValueCenter';
import { HookRender } from './HookRender';
import { ValueCenter } from 'wy-helper';
import { useStoreTriggerRender } from './useStoreTriggerRender';
const map = new Map();
let uid = 1;
function getId(key: any) {
  let v = map.get(key);
  if (!v) {
    v = uid++;
    map.set(key, v);
  }
  return v;
}

export type SharePortalModel = ValueCenter<JSX.Element>[];
export function renderSharePortal(store: ValueCenter<SharePortalModel>) {
  /* eslint-disable */
  return useMemo(() => {
    return (
      <HookRender
        render={() => {
          const list = useStoreTriggerRender(store);
          return (
            <>
              {list.map(row => {
                return (
                  <HookRender
                    key={getId(row)}
                    render={() => {
                      return useMemo(() => {
                        return (
                          <HookRender
                            render={() => {
                              return useStoreTriggerRender(row);
                            }}
                          />
                        );
                      }, [row]);
                    }}
                  />
                );
              })}
            </>
          );
        }}
      />
    );
  }, [store]);
}

export function useCreateSharePortal() {
  const list = useValueCenterWith<SharePortalModel>([]);
  return {
    list,
    append(value: ValueCenter<JSX.Element>) {
      const oldList = list.get().filter(v => v != value);
      list.set(oldList.concat(value));
      return function () {
        list.set(list.get().filter(v => v != value));
      };
    },
  };
}

export type SharePortalOperate = ReturnType<
  typeof useCreateSharePortal
>['append'];

export function useAlawaysCenter(value: JSX.Element, deps?: readonly any[]) {
  const store = useValueCenterWith(value);
  useEffect(() => {
    store.set(value);
  }, deps);
  return store;
}

export function useAppendSharePop(
  store: SharePortalOperate,
  value: JSX.Element,
  deps?: readonly any[]
) {
  const rightPanel = useAlawaysCenter(value, deps);
  useEffect(() => {
    return store(rightPanel);
  }, []);
}

export function useSharePortal() {
  const { list, append } = useCreateSharePortal();

  return {
    render() {
      renderSharePortal(list);
    },
    useAppend(value: JSX.Element, deps?: readonly any[]) {
      useAppendSharePop(append, value, deps);
    },
  };
}
