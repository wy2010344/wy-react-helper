import { useRef, useState } from "react";

export function useRefState<T>(init: T | (() => T), afterSet?: () => void) {
  const [state, setState] = useState(init)
  const ref = useRef(state)
  return [state, function (arg: T) {
    ref.current = arg
    setState(arg)
    afterSet?.()
  }, function () {
    return ref.current
  }] as const
}