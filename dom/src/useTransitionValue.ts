import { useEffect } from "react"
import { useChange } from "wy-react-helper"
import { EmptyFun, run } from "wy-helper"
import { forceFlow, forceFlowClassNames, forceFlowInitClassNames, requestBatchAnimationFrame, splitClassNames } from "wy-dom-helper"

type Getter<T> = (...vs: any[]) => T
/**
 * 这个模仿react-transition-group的并不科学
 * 过渡有准备动作?
 * 事实上hover无准备动作
 * 最多多了一个will-change
 * 
 * 
 * 三态的科学性:
 * 初始态
 * 进入态
 * 退出态
 * 
 * 四态的问题——本质上是两态,主要是针对css动画
 * 基础态+动画目标态.样式只用于动画,不记录为状态
 * 因此动画结束,可能需要删除造成动画的样式
 * 然后手动设置样式
 */
export function useInitClassNames(
  ref: () => Element,
  initCls: string,
  showCls: string,
) {
  const value = {
    init: initCls,
    show: showCls
  }
  return useTriggerClassNames(ref, false, value, value)
}

export function useTriggerClassNames(
  ref: () => Element,
  exiting: any,
  enter: {
    init: string
    show: string
  },
  exit: string | {
    init: string
    show: string
  },
  effect?: () => void | EmptyFun
) {
  useEffect(() => {
    const div = ref()
    if (exiting) {
      if (typeof exit == 'string') {
        forceFlowClassNames(div, exit)
      } else {
        forceFlowInitClassNames(div, exit.init, exit.show)
      }
    } else {
      forceFlowInitClassNames(div, enter.init, enter.show)
    }
    return effect?.()
  }, [!exiting])
  return exiting ? typeof exit == 'string' ? exit : exit.show : enter.show
}

export function useTriggerClassNamesWithShow(
  ref: () => Element,
  exiting: any,
  enter: {
    init: string
    show: string
  },
  exit: string | {
    init: string
    show: string
  },
  resolve: EmptyFun,
  timeout: number,
  show?: string
) {
  const [state, setState] = useChange<string>()
  const cls = useTriggerClassNames(ref, exiting, enter, exit, function () {
    return subscribeTimeout(show ? function () {
      resolve()
      setState(show)
    } : resolve, timeout)
  })
  if (exiting) {
    return cls
  } else {
    return state || cls
  }
}

/*******
 * 元素的过度与动画有一点,可能有别的属性动画,会触发多次
 */
export function useBindTransitionFinish(
  ref: () => Element,
  callback: EmptyFun,
  deps?: readonly any[]
) {
  useEffect(function () {
    const div = ref()
    requestBatchAnimationFrame(function () {
      div.addEventListener("transitionend", callback, {
        once: true
      })
      div.addEventListener("transitioncancel", callback, {
        once: true
      })
    })
    return function () {
      div.removeEventListener("transitionend", callback)
      div.removeEventListener("transitioncancel", callback)
    }
  }, deps)
}
export function useBindAnimationFinish(
  ref: () => Element,
  callback: EmptyFun,
  deps?: readonly any[]
) {
  useEffect(function () {
    const div = ref()
    requestBatchAnimationFrame(function () {
      div.addEventListener("animationend", callback, {
        once: true
      })
      div.addEventListener("animationcancel", callback, {
        once: true
      })
    })
    return function () {
      div.removeEventListener("animationend", callback)
      div.removeEventListener("animationcancel", callback)
    }
  }, deps)
}

export function useBindTimeoutFinish(exiting: any, resolve: EmptyFun, timeout: number) {
  useEffect(() => {
    return subscribeTimeout(resolve, timeout)
  }, [!exiting])
}
/**
 * 需要exitDone,因为如果到时间仍未删除,需要exitDone占位
 */
export type LifeTransState = "init" | "enter" | "show" | "willExit" | "exit"

type LifeStateArg = {
  ref?: Getter<Element | null | undefined>,
  resolve?: EmptyFun,
  disabled?: boolean
  noShowChange?: boolean
}
const defaultLifeStateArg: LifeStateArg = {}
/**
 * exiting默认是true.
 * @param exiting 
 * @param ref 
 * @param resolve 
 * @returns 
 */
export function useLifeState(
  exiting: any,
  arg: LifeStateArg = defaultLifeStateArg
) {
  const [state, setState] = useChange<LifeTransState>(arg.disabled ? 'show' : 'init')
  useEffect(() => {
    if (exiting) {
      setState('exit')
    } else {
      if (arg.disabled) {
        return
      }
      setState('enter')
    }
    if (arg.ref) {
      forceFlow(arg.ref())
    }
  }, [!exiting])
  return [exiting && state != 'exit' ? 'willExit' : state, function () {
    if (state == 'enter') {
      if (arg.noShowChange || arg.disabled) {
        return
      }
      setState('show')
    }
    arg.resolve?.()
  }] as const
}


export function subscribeTimeout(callback: EmptyFun, time: number) {
  /**
   * 需要取消订阅,因为开发者模式useEffect执行多次,不取消会造成问题
   */
  const inv = setTimeout(callback, time)
  return function () {
    clearTimeout(inv)
  }
}


export function useLifeStateTime(
  exiting: any,
  timeout: number | {
    enter: number
    exit: number
  },
  arg: LifeStateArg = defaultLifeStateArg
) {
  const [state, resolve] = useLifeState(exiting, arg)
  useEffect(() => {
    if (state == 'enter') {
      return subscribeTimeout(resolve, typeof timeout == 'number' ? timeout : timeout.enter)
    } else if (state == 'exit') {
      return subscribeTimeout(resolve, typeof timeout == 'number' ? timeout : timeout.exit)
    }
  }, [state])
  return state
}

export function useLifeStateTransition(
  exiting: any,
  arg: LifeStateArg = defaultLifeStateArg
) {
  const [state, resolve] = useLifeState(exiting, arg)
  useEffect(() => {
    const div = arg.ref?.()
    if (div) {
      if (state == 'enter' || state == 'exit') {
        requestBatchAnimationFrame(function () {
          //好像加个时延迟注册要靠谱一些,不然会被之前的动画冲掉
          div.addEventListener("transitionend", resolve, {
            once: true
          })
          div.addEventListener("transitioncancel", resolve, {
            once: true
          })
        })
        return function () {
          div.removeEventListener("transitionend", resolve)
          div.removeEventListener("transitioncancel", resolve)
        }
      }
    }
  }, [state])
  return state
}

export type LiftStateModel<T> = {
  init: T
  enter: T
  show?: T | boolean
  willExit?: T | boolean
  exit: T
}

export function getLifeState<T>(model: LiftStateModel<T>, state: LifeTransState) {
  if (state == 'init' || state == 'enter' || state == 'exit') {
    return model[state]
  } else if (state == 'willExit') {
    const v = model[state]
    if (typeof v == 'string') {
      return v
    }
  }
  const v = model['show']
  if (typeof v == 'string') {
    return v
  }
  return model['enter']
}
