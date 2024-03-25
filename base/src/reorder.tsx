import { useEffect, useMemo } from "react";
import { PointKey, Reorder, emptyArray, pointZero } from "wy-helper";
export function useReorder(
  axis: PointKey,
  shouldRemove: (key: any) => boolean,
  moveItem: (itemKey: any, baseKey: any) => void
) {
  const rd = useMemo(() => {
    const rd = new Reorder(moveItem)
    return rd
  }, emptyArray)
  useEffect(() => {
    rd.updateLayoutList(axis, shouldRemove)
  })
  useEffect(() => {
    rd.end(pointZero)
  }, [axis])
  return rd
}