import { useEffect, useRef } from "react";

/**
 * 变化方向,只在触发时
 * @param value 索引
 * @returns 0不变,1向左,-1向右,索引必须大于1
 */
export function useDirection(value: number) {
  if (value < 0) {
    value = 0
  }
  const beforeRef = useRef(value)
  useEffect(() => {
    beforeRef.current = value
  }, [value])
  const row = value - beforeRef.current
  const dir = Math.sign(row) as -1 | 0 | 1
  return [dir, value, row] as const
}


export function useBefore<T>(value: T) {
  const historyTab = useRef<T[]>()
  useEffect(() => {
    if (!historyTab.current) {
      historyTab.current = []
    }
    historyTab.current.unshift(value)
    if (historyTab.current.length > 2) {
      historyTab.current.length = 2
    }
  }, [value])
  return () => {
    return historyTab.current?.at(-1)
  }
}