import { useCallback, useRef, useState } from "react";
import { useChange } from "./useChange";
import { emptyArray } from "./util";
import { ReadOnlyRef } from "./useAlaways";

type RefState<T> = [T, (v: T) => void, ReadOnlyRef<T>]
export function useRefState<T, M>(init: M, trans: (v: M) => T): RefState<T>
export function useRefState<T>(init: T): RefState<T>
export function useRefState() {
  const [init, trans] = arguments[1]
  const [state, setState] = useChange(init, trans)
  const lock = useRef(state)
  const setValue = useCallback((value) => {
    if (value != lock.current) {
      lock.current = value
      setState(value)
    }
  }, emptyArray)
  return [state, setValue, lock]
}