import { useMemo, useRef } from "react"
import { emptyArray } from "./util"

let id = 0
/**
 * 会随deps增加
 * @param deps 
 * @returns 
 */
export function useOnlyId(deps?: readonly any[]) {
  return useMemo(getOnlyId, deps || emptyArray)
}
export function getOnlyId() {
  return id++
}