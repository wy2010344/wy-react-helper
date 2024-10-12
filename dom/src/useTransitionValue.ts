import { useEffect } from "react"
import { useAtom } from "wy-react-helper"
import { EmptyFun, delay, emptyArray } from "wy-helper"
import { CNSInfer, ClsWithStyle, GetRef, TriggerMConfig, effectCssAinmationFirst, effectCssAnimationOther } from "wy-dom-helper"
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


export function useTriggerStyle<
  T extends ElementCSSInlineStyle & Element,
  M extends ClsWithStyle,
  Dep extends readonly any[]
>(
  ref: GetRef<T>,
  render: (deps: Dep) => TriggerMConfig<T, M>,
  deps: Dep
) {
  const cacheStyle = useAtom<[M, CNSInfer<M>]>(null as any)
  useEffect(() => {
    const out = render(deps)
    if (cacheStyle.get()) {
      return effectCssAnimationOther(ref, out, cacheStyle)
    } else {
      return effectCssAinmationFirst(ref, out, cacheStyle)
    }
  }, deps)
  return render(deps).target
}
/**
 * 只做入场动画
 * @param ref 
 * @param init 
 * @returns 
 */
export function useTriggerStyleInit<
  T extends ElementCSSInlineStyle & Element,
  M extends ClsWithStyle
>(
  ref: GetRef<T>,
  init: TriggerMConfig<T, M>
) {
  useEffect(() => {
    return effectCssAinmationFirst(ref, init)
  }, emptyArray)
  return init.target
}

export function useTriggerStyleWithShow<
  T extends ElementCSSInlineStyle & Element,
  M extends ClsWithStyle
>(
  ref: GetRef<T>,
  exiting: any,
  init: TriggerMConfig<T, M>,
  exit: TriggerMConfig<T, M>
) {
  return useTriggerStyle(ref, function () {
    if (exiting) {
      return exit
    } else {
      return init
    }
  }, [!exiting])
}