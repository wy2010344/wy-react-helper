import { useMemo, useState } from "react"
import { emptyArray, Quote, SetValue } from "wy-helper"

type Op<T> = {
  id: number,
  callback: Quote<T>
}
function callbackOb<T>(init: T, row: Op<T>) {
  return row.callback(init)
}
let uid = Number.MIN_SAFE_INTEGER
export function useBatchOptimistic<T>(value: T, set: SetValue<Quote<T>>) {
  const [ops, setOps] = useState<readonly Op<T>[]>(emptyArray)
  return {
    originalValue: value,
    originalSet: set,
    value: useMemo(() => {
      return ops.reduce(callbackOb, value)
    }, [ops, value]),
    set(callback: Quote<T>) {
      const id = uid++
      setOps(ops => ops.concat({
        id,
        callback
      }))
      function reset() {
        setOps(ops => ops.filter(x => x.id != id))
      }
      return {
        reset,
        id,
        commit() {
          set(callback)
          reset()
        }
      }
    },
    idInLoading(id: number) {
      return ops.find(x => x.id == id)
    },
    opCountInWait: ops.length
  }
}