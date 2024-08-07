import { createPortal } from "react-dom"
import { EmptyFun, quote } from "wy-helper"
import { renderList, useAdd } from "wy-react-helper"

export function genTemplateString(ts: TemplateStringsArray, vs: (string | number)[]) {
  const xs: any[] = []
  for (let i = 0; i < vs.length; i++) {
    xs.push(ts[i])
    xs.push(vs[i])
  }
  xs.push(ts[vs.length])
  return xs.join('')
}

const freeze = Object.freeze ? Object.freeze.bind(Object) : quote
export type TOrQuote<T extends {}> = T | ((v: T) => T | void)
export function lazyOrInit<T extends {}>(v: TOrQuote<T>) {
  let o: any
  if (typeof v == 'function') {
    const obj = {
      style: {}
    }
    o = (v as any)(obj) || obj
  } else {
    o = v
  }
  return o
}

export function afterFreeze(o: any) {
  if (o) {
    if (o.style) {
      o.style = freeze(o.style)
    }
    o = freeze(o)
  }
}



export function renderPortal(node: Element, fun: EmptyFun) {
  useAdd(createPortal(renderList(fun), node))
}