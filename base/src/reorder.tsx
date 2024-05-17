import { useEffect, useMemo } from "react";
import { PointKey, ReadArray, Reorder, emptyArray, pointZero } from "wy-helper";
export function useReorder<T, K>(
  list: ReadArray<T>,
  getKey: (v: T) => K,
  moveItem: (itemKey: K, baseKey: K) => void,
  axis?: PointKey,
  gap = 0
) {
  const rd = useMemo(() => {
    const rd = new Reorder(moveItem, axis, gap)
    return rd
  }, emptyArray)
  useEffect(() => {
    rd.updateLayoutList(moveItem, axis || 'y', list, getKey, gap)
  })
  useEffect(() => {
    rd.end(pointZero)
  }, [axis])
  return rd
}