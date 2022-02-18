import { useEffect, useState } from "react"

export type NotifyHandler<T> = (v: T) => void
export class ValueCenter<T>{
  private pool: Set<NotifyHandler<T>> = new Set()
  constructor(
    private value: T
  ) { }
  get() {
    return this.value
  }
  set(value: T) {
    this.value = value
    this.pool.forEach(notify => notify(value))
  }
  add(notify: NotifyHandler<T>) {
    if (!this.pool.has(notify)) {
      this.pool.add(notify)
      notify(this.value)
      return true
    }
    return false
  }
  remove(notify: NotifyHandler<T>) {
    return this.pool.delete(notify)
  }
}

/**
 * add this hooks so can render current component
 * @param store 
 */
export function useStoreTriggerRender<T>(store: ValueCenter<T>) {
  const [state, setState] = useState<T>(store.get())
  useEffect(function () {
    store.add(setState)
    return function () {
      store.remove(setState)
    }
  }, [store])
  return state
}
