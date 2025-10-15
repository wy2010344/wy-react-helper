import { useVersion } from './useVersion';
import {
  alawaysTrue,
  createEmptyExitListCache,
  emptyArray,
  emptyObject,
  buildUseExitAnimate,
  ExitAnimateArg,
  ExitModel,
  FalseType,
  quote,
} from 'wy-helper';
import { useAtomFun } from './useRefConst';
import React, { useEffect } from 'react';
import { HookRender } from './HookRender';
import { useVersionLock } from './Lock';
import { JSX } from 'react';
export function useExitAnimate<V>(
  outlist: readonly V[],
  getKey: (v: V) => any,
  arg: ExitAnimateArg<V> = emptyObject
): readonly ExitModel<V>[] {
  //用于删除后强制刷新
  const [_, updateVersion] = useVersion();
  //每次render进来,合并cacheList,因为有回滚与副作用,所以必须保持所有变量的无副作用
  const cacheList = useAtomFun(createEmptyExitListCache).get();
  const [__, getNextVersion] = useVersionLock();
  const { list, effect } = buildUseExitAnimate(
    updateVersion,
    cacheList,
    getNextVersion,
    outlist,
    getKey,
    arg
  );
  useEffect(effect);
  return list;
}
/**
 * 有一个可以直接嵌入
 * @param param0
 * @returns
 */
export function ExitAnimate<V>({
  list,
  getKey,
  render,
  ...args
}: {
  list: readonly V[];
  getKey(v: V): any;
  render: (v: ExitModel<V>) => JSX.Element;
} & ExitAnimateArg<V>) {
  const outList = useExitAnimate(list, getKey, args);
  return <>{renderExitAnimate(outList, render)}</>;
}

export function renderExitAnimate<V>(
  list: readonly ExitModel<V>[],
  render: (row: ExitModel<V>) => JSX.Element
) {
  return list.map(row => {
    return (
      <HookRender
        key={row.key}
        render={() => {
          return render(row);
        }}
      />
    );
  });
}

/**
 * 只有一个元素的,只处理替换
 */
export function OneExitAnimate<T>({
  value,
  getKey = quote,
  ignore,
  ...args
}: {
  value: T;
  getKey?: (v: T) => any;
  ignore?: any;
  onAnimateComplete?(): void;
  render: (v: ExitModel<T>) => JSX.Element;
}) {
  return (
    <ExitAnimate<T>
      list={[value]}
      {...args}
      getKey={getKey}
      enterIgnore={ignore ? alawaysTrue : undefined}
      exitIgnore={ignore ? alawaysTrue : undefined}
    />
  );
}

export function IfExitAnimate<T>({
  show,
  renderTrue,
  other,
}: {
  show: T;
  renderTrue: (v: ExitModel<Exclude<T, FalseType>>) => JSX.Element;
  other?: ExitAnimateArg<T> & {
    renderFalse?(v: ExitModel<Extract<T, FalseType>>): JSX.Element;
  };
}) {
  return (
    <ExitAnimate
      list={show ? [show] : other?.renderFalse ? [show] : emptyArray}
      getKey={renderIfGetKey}
      {...other}
      render={function (v) {
        if (v.value) {
          return renderTrue(v as any);
        } else if (other?.renderFalse) {
          return other.renderFalse(v as any);
        }
        return <></>;
      }}
    />
  );
}

function renderIfGetKey<T>(v: T) {
  return !v;
}
