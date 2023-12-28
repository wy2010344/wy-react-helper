import React, { useMemo } from 'react'
import { useValueCenterWith } from './ValueCenter'
import { useStoreTriggerRender } from './useStoreTriggerRender'

/**
 * 返回组件
 * @param render 
 * @returns 
 */
export default function usePopElement(render: React.ReactNode) {
  const store = useValueCenterWith(render)
  store.set(render)
  return useMemo(() => {
    return function () {
      return useStoreTriggerRender(store)
    }
  }, [store])
}
