import React from "react"
import { Key } from "react"
import { EmptyFun, emptyObject, objectFreeze } from "wy-helper"

export function generateHook() {
  return function HookRender({
    render
  }: {
    render: () => JSX.Element
  }) {
    return render()
  }
}
export const HookRender = generateHook()




let globalCtx: any[] = []
function useCreate(ctx: any[]) {
  const oldCtx = globalCtx
  globalCtx = ctx
  return oldCtx
}
export function useAdd(v: any) {
  globalCtx.push(v)
}
function useFinish(oldCtx: any[]) {
  globalCtx = oldCtx
}

export function renderList(render: EmptyFun) {
  const ctx: any[] = []
  const old = useCreate(ctx)
  render()
  useFinish(old)
  return objectFreeze(ctx)
}


export function renderForEach(
  forEach: (callback: (key: Key, callback: EmptyFun) => void) => void
) {
  return React.createElement(
    React.Fragment,
    emptyObject,
    renderList(function () {
      forEach(function (key, callback) {
        useAdd(React.createElement(
          React.Fragment,
          { key },
          renderList(callback)))
      })
    }))
}

export function Br({
  render
}: {
  render: EmptyFun
}) {
  const ctx = renderList(render)
  return React.createElement(React.Fragment, emptyObject, ...ctx)
}