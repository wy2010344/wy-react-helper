import { ExitAnimateMode, ExitModel, HookRender, OneExitAnimate } from "wy-react-helper"
import { useBaseLifeTransSameTime, useLifeTransSameTime } from "./useTransitionValue"
import React from "react"






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
  //只创建(新增)
  from: T
  show: T,
  willExit?: never
  exit?: never
  timeout: number
} | {
  //只销毁,告知销毁,并配送销毁参数
  from?: never
  show?: never
  willExit?: T
  exit: T
  timeout: number
}

export function OneTAnimateTime<T>(
  {
    value,
    render,
    ...args
  }: {
    onAnimateComplete?(): void,
    value: TAnimateValueTime<T>,
    render: (
      args: T,
      ext: {
        exiting?: boolean;
        promise: Promise<any>;
      }
    ) => JSX.Element
  },
) {
  return <OneExitAnimate
    show={value.from}
    {...args}
    render={v => {
      return <HookRender
        key={v.key}
        render={() => {
          const args = useLifeTransSameTime<T>(
            v.exiting,
            value as any,
            v.resolve,
            value.timeout)!
          return render(args, v)
        }}
      />
    }}
  />
}


export type TAnimateValue<T> = {
  //只创建(新增)
  from: T
  show: T,
  willExit?: never
  exit?: never
} | {
  //只销毁,告知销毁,并配送销毁参数
  from?: never
  show?: never
  willExit?: T
  exit: T
}

export function OneTAnimate<T>(
  {
    value,
    render,
    ...args
  }: {
    onAnimateComplete?(): void,
    value: TAnimateValue<T>,
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
    show={value.from}
    {...args}
    render={v => {
      return <HookRender
        key={v.key}
        render={() => {
          const args = useBaseLifeTransSameTime<T>(
            v.exiting,
            value as any)
          return render(args, v)
        }}
      />
    }}
  />
}