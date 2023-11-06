import React from "react";
import { useStoreTriggerRender, valueCenterOf } from "./ValueCenter";


function initSharePop(): {
  stacks: React.ReactNode[]
  index: number
} {
  return {
    stacks: [],
    index: -1
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
    Provider() {
      const { stacks, index } = useStoreTriggerRender(popCenter)
      return stacks[index]
    },
    push(element: React.ReactNode) {
      const { stacks, index } = popCenter.get()
      const newIndex = index + 1
      popCenter.set({
        stacks: stacks.slice(0, index).concat(element),
        index: newIndex
      })
    },
    replace(element: React.ReactNode) {
      const { stacks, index } = popCenter.get()
      popCenter.set({
        stacks: stacks.slice(0, index - 1).concat(element),
        index
      })
    },
    go(n: number) {
      if (n != 0) {
        const { stacks, index } = popCenter.get()
        let newIndex = index + n
        if (newIndex < 0) {
          newIndex = 0
        } else if (newIndex >= stacks.length) {
          newIndex = stacks.length - 1
        }
        popCenter.set({
          index: newIndex,
          stacks
        })
      }
    }
  }
}