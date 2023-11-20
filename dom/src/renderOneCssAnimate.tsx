import { ExitAnimate, HookRender, OneExitAnimate, emptyArray } from "wy-react-helper"
import { useBaseLifeTransSameTime, useLifeTransSameTime } from "./useTransitionValue"
import React, { } from "react"






export type ClassAndStyle = {
  className?: string
  style?: React.CSSProperties
}

/**
 * 这里不处理替换
 * 替换是各自处理自己的参数
 * 但替换就涉及像scene怎样转场.
 * 像依赖上一步的push或pop
 * 或者平行替换,replace,各自处理自己的
 * 平等替换很简单,各自作自己的配置
 */
export type TAnimateValueTime<T> = {
  //创建与销毁的配置.在销毁时仍然生效
  from?: T
  show?: T
  willExit?: T
  exit?: T
  timeout: number
}

export function OneTAnimateTime<T>(
  {
    value,
    render,
    ...args
  }: {
    onAnimateComplete?(): void,
    show?: any
    ignore?: any
    value: TAnimateValueTime<T>,
    render: (
      args: T | undefined,
      ext: {
        exiting?: boolean;
        promise: Promise<any>;
      }
    ) => JSX.Element
  },
) {
  return <OneExitAnimate
    {...args}
    render={v => {
      return <HookRender
        key={v.key}
        render={() => {
          const ct = useLifeTransSameTime<T>(
            v.exiting,
            value as any,
            v.resolve,
            value.timeout, args.ignore)!
          return render(ct, v)
        }}
      />
    }}
  />
}

export type FAnimateTime<T> = {
  //没有from的时候,enter忽略
  from?: T
  show: T
  willExit?: T
  //没有exit的时候,exit忽略
  exit?: T
  timeout: number
  exitTimeout?: number
}
export function OneFAnimateTime<T>(
  {
    show,
    render,
    defaultExit,
    customExit,
    ...args
  }: {
    onAnimateComplete?(): void,
    show?: FAnimateTime<T> | false | null
    //默认的退出,也依外部最新.如果没有指定配置
    defaultExit?: {
      willExit?: T
      exit: T
      timeout?: number
    }
    //外部定义的退出,也依外部最新,如果没有指定配置
    customExit?: {
      willExit?: T
      exit: T
      timeout?: number
    }
    render: (
      args: T | undefined,
      ext: {
        exiting?: boolean;
        promise: Promise<any>;
      }
    ) => JSX.Element
  },
) {
  return <ExitAnimate<FAnimateTime<T>>
    {...args}
    getKey={getOneKey}
    list={show ? [show] : emptyArray as any}
    enterIgnore={enterIgnoreNoFrom}
    exitIgnore={defaultExit || customExit ? ignoreFalse : exitIgnoreNoExit}
    render={v => {
      return <HookRender
        key={v.key}
        render={() => {
          const ct = useLifeTransSameTime<T>(
            v.exiting,
            {
              ...defaultExit,
              ...v.value,
              ...customExit
            } as any,
            v.resolve,
            v.exiting ? customExit?.timeout || v.value.exitTimeout || v.value.timeout || defaultExit?.timeout! : v.value.timeout, !v.value.from)!
          return render(ct, v)
        }}
      />
    }}
  />
}

function enterIgnoreNoFrom(v: {
  from?: any
}) {
  return !v.from
}
function exitIgnoreNoExit(v: {
  exit?: any
}) {
  return !v.exit
}

function getOneKey() {
  return 1
}

export type TAnimateValue<T> = {
  //创建与销毁的配置.在销毁时仍然生效
  from?: T
  show?: T,
  willExit?: T
  exit?: T
}

export function OneTAnimate<T>(
  {
    value,
    render,
    ...args
  }: {
    onAnimateComplete?(): void,
    value: TAnimateValue<T>,
    show?: any
    ignore?: any
    render: (
      args: T,
      ext: {
        exiting?: boolean;
        promise: Promise<any>;
        resolve(v?: any): void
      }
    ) => JSX.Element
  },
) {
  return <OneExitAnimate
    {...args}
    render={v => {
      return <HookRender
        key={v.key}
        render={() => {
          const ct = useBaseLifeTransSameTime<T>(
            v.exiting,
            value as any, {
            disabled: args.ignore
          })
          return render(ct, v)
        }}
      />
    }}
  />
}



export type FAnimateConfig<T> = {
  //没有from的时候,enter忽略
  from?: T
  show: T
  willExit?: T
  //没有exit的时候,exit忽略
  exit?: T
}
export function OneFAnimate<T>(
  {
    show,
    render,
    defaultExit,
    customExit,
    ...args
  }: {
    onAnimateComplete?(): void,
    show?: FAnimateConfig<T> | false | null
    //默认的退出,也依外部最新.如果没有指定配置
    defaultExit?: {
      willExit?: T
      exit: T
    }
    //外部定义的退出,也依外部最新,如果没有指定配置
    customExit?: {
      willExit?: T
      exit: T
    }
    render: (
      args: T,
      ext: {
        exiting?: boolean;
        promise: Promise<any>;
      }
    ) => JSX.Element
  },
) {
  return <ExitAnimate<FAnimateConfig<T>>
    {...args}
    getKey={getOneKey}
    list={show ? [show] : emptyArray as any}
    enterIgnore={enterIgnoreNoFrom}
    exitIgnore={defaultExit || customExit ? ignoreFalse : exitIgnoreNoExit}
    render={v => {
      return <HookRender
        key={v.key}
        render={() => {
          const ct = useBaseLifeTransSameTime<T>(
            v.exiting,
            {
              ...defaultExit,
              ...v.value,
              ...customExit
            } as any, {
            disabled: !v.value.from
          })!
          return render(ct, v)
        }}
      />
    }}
  />
}
function ignoreFalse() {
  return false
}