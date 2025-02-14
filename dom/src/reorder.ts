

import { useReorder as useBaseReorder } from "wy-react-helper"
import { reorderChildChangeIndex } from "wy-dom-helper"
import { Box, EmptyFun, Point, ReorderChild, PointKey, emptyArray, ReadArray, emptyObject } from "wy-helper"
import { useEffect, useMemo } from "react"


export function useReorder<T, K>(
  list: ReadArray<T>,
  getKey: (v: T) => K,
  moveItem: (itemKey: any, baseKey: any) => void,
  {
    gap,
    axis
  }: {
    gap?: number
    axis?: PointKey,
  } = emptyObject
) {
  const rd = useBaseReorder(list, getKey, moveItem, axis, gap)

  return function (
    key: K,
    index: number,
    getDiv: () => HTMLElement,
    getTrans: () => Point,
    changeTo: (value: Point) => void,
    onLayout: (diff: Point) => void,
    updateBox?: (box: Box) => void
  ) {
    const child = useMemo(() => {
      return new ReorderChild(rd, key, getTrans, changeTo)
    }, emptyArray)
    useEffect(() => {
      return reorderChildChangeIndex(child, getDiv(), onLayout, updateBox)
    }, [index])
    return function (loc: Point,
      onFinish: EmptyFun) {
      child.start(loc, onFinish)
      return {
        end: rd.end.bind(rd),
        move: rd.move.bind(rd),
        setMoveDiff: rd.setMoveDiff.bind(rd)
      }
    }
  }
}