import { useMemo } from 'react'
import { animateFrame } from 'wy-dom-helper'
import { emptyArray } from 'wy-helper'

export * from './useTransitionValue'
export * from './useMatchMedia'
export * from './useOnLine'
export * from './stylis'
export * from './useContentEditable'
export * from './util'
export * from './reorder'
export * from './useClickOutside'


export function useAnimateFrame(value: number) {
  return useMemo(() => animateFrame(value), emptyArray)
}