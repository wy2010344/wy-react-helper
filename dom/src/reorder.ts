

import { useReorder as useBaseReorder } from "wy-react-helper"
import { getReorderOnScroll, reorderChildChangeIndex } from "wy-dom-helper"
import { Box, EmptyFun, Point, ReorderChild, PointKey, emptyArray } from "wy-helper"
import { useEffect, useMemo } from "react"


export function useReorder(
  axis: PointKey,
  shouldRemove: (key: any) => boolean,
  moveItem: (itemKey: any, baseKey: any) => void
) {
  const rd = useBaseReorder(axis, shouldRemove, moveItem)

  const data = useMemo(() => {
    return {
      end: rd.end.bind(rd),
      move: rd.move.bind(rd),
      onScroll: getReorderOnScroll(rd)
    }
  }, emptyArray)

  return {
    ...data,
    useChild(
      key: any,
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
      return function (loc: Point, onFinish: EmptyFun) {
        child.start(loc, onFinish)
      }
    }
  }
}