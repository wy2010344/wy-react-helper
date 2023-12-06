import React from "react";
import { useStoreTriggerRender, valueCenterOf } from "./ValueCenter";
import { getOutResolvePromise } from "./util";


function initSharePop(): {
  stacks: {
    children: React.ReactNode
    resolve(v: any): void
  }[],
  method?: 'push' | 'pop'
} {
  return {
    stacks: []
  }
}
/**
 * pop只有一个,是一种弹窗路由.
 * 从router一样,应该使用组件本身作为key.
 * 只展示最后一个
 * 
 * 是否可以通过context传递useContent?
 * 当然可以包装在context里
 * @returns 
 */
export function createSharePop() {
  const popCenter = valueCenterOf(initSharePop())
  return {
    useProvider() {
      return useStoreTriggerRender(popCenter)
    },
    size() {
      return popCenter.get().stacks.length
    },
    push<T>(element: React.ReactNode) {
      const { stacks } = popCenter.get()
      const [promise, resolve] = getOutResolvePromise<T>()
      popCenter.set({
        stacks: stacks.concat({
          children: element,
          resolve
        }),
        method: "push"
      })
      return promise
    },
    back(n?: any) {
      const stacks = popCenter.get().stacks.slice()
      const last = stacks.pop()
      if (last) {
        last.resolve(n)
        popCenter.set({
          stacks,
          method: "pop"
        })
      }
    }
  }
}