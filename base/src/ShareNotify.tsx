import React from "react";
import { HookRender } from "./HookRender";
import { getOnlyId } from "./useOnlyId";
import { useStoreTriggerRender } from "./useStoreTriggerRender";
import { valueCenterOf } from "wy-helper";





type NotifyProps = {
  id: number
  element: JSX.Element
}

/**
 * notify有多个
 * 从router一样,应该使用组件本身作为key.
 * 
 * 可能有多种操作列表
 * @returns 
 */
export function createSharePop() {
  const notifyCenter = valueCenterOf<NotifyProps[]>([])
  return {
    Provider() {
      const notifys = useStoreTriggerRender(notifyCenter)
      return <>{notifys.map(notify => {
        return <HookRender key={notify.id} render={() => {
          return notify.element
        }} />
      })}</>
    },
    add(v: JSX.Element) {
      const id = getOnlyId()
      notifyCenter.set(notifyCenter.get().concat({
        id,
        element: v
      }))
      return function () {
        notifyCenter.set(notifyCenter.get().filter(v => v.id != id))
      }
    }
  }
}