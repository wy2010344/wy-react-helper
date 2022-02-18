import { ValueCenter } from "./ValueCenter"


interface StringBridge<T> {
  toString(v: T): string
  fromString(v: string): T
  value: ValueCenter<T>
}

export function defaultToString(v: any) {
  return v + ""
}
export function jsonToString(v: object) {
  return JSON.stringify(v)
}
export function createShareStore({
  map,
  read,
  write
}: {
  map: {
    [key: string]: StringBridge<any>
  },
  read(key: string): string
  write(key: string, value: string): void
}) {
  const deletePool: Map<string, {
    value: StringBridge<any>
    notify(v: any): void
  }> = new Map()
  Object.entries(map).forEach(function ([key, value]) {
    function notify(v: any) {
      write(key, value.toString(v))
    }
    deletePool.set(key, {
      value,
      notify
    })
    value.value.add(notify)
  })
  return {
    init() {
      deletePool.forEach(function ({ value }, key) {
        value.value.set(read(key))
      })
    },
    destroy() {
      deletePool.forEach(function ({ value, notify }) {
        value.value.remove(notify)
      })
    }
  }
}