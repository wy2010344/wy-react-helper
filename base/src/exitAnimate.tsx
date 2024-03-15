
import { useVersion } from "./useVersion"
import { alawaysTrue, createEmptyExitListCache, emptyArray, emptyObject, buildUseExitAnimate, ExitAnimateArg, ExitModel } from "wy-helper"
import { useAtomFun } from "./useRefConst"
import React, { useEffect } from "react"
import { HookRender } from "./HookRender"
import { useVersionLock } from "./Lock"
export function useExitAnimate<V>(outlist: readonly V[], getKey: (v: V) => any, arg: ExitAnimateArg<V> = emptyObject): readonly ExitModel<V>[] {

  //用于删除后强制刷新
  const [_, updateVersion] = useVersion()
  //每次render进来,合并cacheList,因为有回滚与副作用,所以必须保持所有变量的无副作用
  const cacheList = useAtomFun(createEmptyExitListCache).get()
  const [__, getNextVersion] = useVersionLock()
  const { list, effect } = buildUseExitAnimate(updateVersion, cacheList, getNextVersion, outlist, getKey, arg)
  useEffect(effect)
  return list
}
/**
 * 有一个可以直接嵌入
 * @param param0 
 * @returns 
 */
export function ExitAnimate<V>(
  { list,
    getKey,
    render,
    ...args
  }: {
    list: readonly V[],
    getKey(v: V): any
    render: (v: ExitModel<V>) => JSX.Element
  } & ExitAnimateArg<V>
) {
  const outList = useExitAnimate(list, getKey, args)
  return <>{renderExitAnimate(outList, render)}</>
}


export function renderExitAnimate<V>(list: readonly ExitModel<V>[], render: (row: ExitModel<V>) => JSX.Element) {
  return list.map(row => {
    return <HookRender key={row.key} render={() => {
      return render(row)
    }} />
  })
}

/**
 * 只有一个元素的
 * 不处理替换,替换可能是各自配置,可能是push等
 * 主要是各自配置出入动画
 */
export function OneExitAnimate<T>(
  {
    show,
    ignore,
    ...args
  }: {
    show?: T | undefined | null | false | void,
    ignore?: any
    onAnimateComplete?(): void,
    render: (v: ExitModel<T>) => JSX.Element
  },
) {
  return <ExitAnimate<T>
    list={show ? [show] : emptyArray}
    {...args}
    getKey={alawaysTrue}
    enterIgnore={show && ignore ? alawaysTrue : undefined}
    exitIgnore={!show && ignore ? alawaysTrue : undefined}
  />
}