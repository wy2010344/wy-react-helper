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
export * from './br/util'
export * from './br/dom'
export * from './br/svg'
export * from './br/attr'
export * from './useBigSpin'
export * from './XDom'
export function useAnimateFrame(value: number) {
  return useMemo(() => animateFrame(value), emptyArray)
}