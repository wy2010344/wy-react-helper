import React, { useEffect, useMemo, useRef, JSX } from 'react';
import { flushSync } from 'react-dom';
import { ComponentValueCache, subscribeEventListener } from 'wy-dom-helper';
import {
  contentEditableText,
  EditRecord,
  ContentEditableModel,
  fixScroll,
  MbRange,
  initContentEditableModel,
  getCurrentEditRecord,
} from 'wy-dom-helper/contentEditable';
import {
  anyStoreTransform,
  emptyArray,
  GetValue,
  StoreTransform,
} from 'wy-helper';
import {
  HookRender,
  useStoreTriggerRender,
  useValueCenter,
  useVersion,
} from 'wy-react-helper';

const triggerArg = {
  triggerType: flushSync,
};
export function useControlledEditable(
  value: string,
  onChange: (v: string, range: MbRange) => void
) {
  const model = useValueCenter(() => initContentEditableModel(value));

  const store = useMemo(() => {
    return {
      get: model.get.bind(model),
      set(v: ContentEditableModel) {
        model.set(v);
        const c = getCurrentEditRecord(v);
        onChange(c.value, c.range);
      },
    };
  }, emptyArray);
  return [useStoreTriggerRender(model, triggerArg), store] as const;
}
/**
 * @todo 使用ValueCenter或Signal,再flushSync的方式同步回state,
 *  再做成受控组件,需要useLayoutEffect去同步两处状态
 * @param t
 * @param initFun
 * @returns
 */
export function useContentEditable(value: ContentEditableModel) {
  const current = useMemo(() => {
    return value.history[value.currentIndex];
  }, [value.history, value.currentIndex]);
  return {
    current,
    renderContentEditable(args: {
      readonly?: boolean;
      noFocus?: boolean;
      renderContent(ref: React.RefObject<HTMLElement>): JSX.Element;
    }) {
      return (
        <HookRender
          key={current.value}
          render={function () {
            /* eslint-disable */
            const ref = useRef<HTMLElement>(null);
            useEffect(() => {
              const div = ref.current!;
              if (args.readonly) {
                div.contentEditable = 'false';
              } else {
                div.contentEditable = `${contentEditableText}`;
              }
            }, [args.readonly]);
            useEffect(() => {
              if (args.noFocus) {
                return;
              }
              const div = ref.current!;
              fixScroll(div, current);
            }, emptyArray);
            return args.renderContent(ref);
          }}
        />
      );
    },
  };
}

export type TriggerTime = 'onInput' | 'onBlur';
/**
 * T 模型值
 * V 从元素中取出来的值
 * @param param0
 * @param deps
 */
export function useContentEditablePure<T, V = T>(
  {
    getCache,
    triggerTime = 'onInput',
    value,
    setValue,
    transform = anyStoreTransform as StoreTransform<T, V>,
  }: {
    getCache: GetValue<ComponentValueCache<HTMLElement, V>>;
    triggerTime?: TriggerTime;
    value: T;
    setValue: (v: T) => void;
    transform?: StoreTransform<T, V>;
  },
  /**
   * 生成cache的依赖
   */
  deps: readonly any[] = emptyArray
) {
  const [version, updateVersion] = useVersion();
  const cacheRef = useRef<ComponentValueCache<HTMLElement, V>>();
  useEffect(() => {
    cacheRef.current = getCache();
  }, deps);
  useEffect(() => {
    const cache = cacheRef.current;
    if (cache) {
      const div = cache.input;
      const update = () => {
        updateVersion();
        //是否需要实时更新?flushSync?
        transform.fromComponent(cache.get(), setValue);
      };
      if (triggerTime == 'onInput') {
        return subscribeEventListener(div, 'input', update);
      }
      if (triggerTime == 'onBlur') {
        return subscribeEventListener(div, 'blur', update);
      }
    } else {
      console.warn('not generate cache');
    }
  }, [triggerTime, ...deps]);
  useEffect(() => {
    const cache = cacheRef.current;
    if (cache) {
      if (transform.shouldChange(value, cache.get())) {
        cache.set(transform.toComponentValue(value));
      }
    }
  }, [value, version, ...deps]);
}
