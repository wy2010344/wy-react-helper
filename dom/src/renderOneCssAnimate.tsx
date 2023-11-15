import { ExitAnimateMode, ExitModel, HookRender, OneExitAnimate, emptyArray } from "wy-react-helper"
import { useBaseLifeTransSameTime, useLifeTransSameTime } from "./useTransitionValue"
import React, { useEffect, useRef } from "react"






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
      args: T | undefined,
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