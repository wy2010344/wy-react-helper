import { EmptyFun, emptyFun, emptyObject } from "wy-helper"
import { afterFreeze, genTemplateString, lazyOrInit, TOrQuote } from "./util"
import React from "react"
import { createPortal } from "react-dom"
import { CSSProperties } from "wy-dom-helper"
import { renderList, useAdd } from "wy-react-helper"
export class DomCreater<M extends {}, T extends string> {
  /**
   * 其实这3个属性可以改变,
   * 因为只在最终render阶段释放.
   * 主要是portal可以改变
   * 其实attr也可以改变.只有type一开始就不再可以改变
   * @param type 
   * @param attrsEffect 
   * @param portal 
   */
  constructor(
    public readonly type: T
  ) { }

  public attrsEffect: TOrQuote<M> = emptyObject as any
  attrs(v: TOrQuote<M>) {
    this.attrsEffect = v
    return this
  }
  portal: Element | undefined
  setPortal(n?: Element) {
    this.portal = n
    return this
  }
  renderHtml(ts: TemplateStringsArray, ...vs: (string | number)[]) {
    return this.renderInnerHTML(genTemplateString(ts, vs))
  }
  renderText(ts: TemplateStringsArray, ...vs: (string | number)[]) {
    return this.renderTextContent(genTemplateString(ts, vs))
  }
  renderInnerHTML(innerHTML = '') {
    this.allRender(emptyFun, {
      __html: innerHTML
    })
  }
  renderTextContent(textContent = '') {
    this.render(() => {
      useAdd(textContent)
    })
  }

  private allRender(
    fun: EmptyFun,
    dangerouslySetInnerHTML?: {
      __html: string | TrustedHTML;
    }) {
    const ctx = renderList(fun)
    let props = lazyOrInit(this.attrsEffect)
    if (dangerouslySetInnerHTML) {
      if (!props) {
        props = {}
      }
      props.dangerouslySetInnerHTML = dangerouslySetInnerHTML
    }
    afterFreeze(props)
    let v: any = React.createElement(this.type as any, props, ...ctx)
    if (this.portal) {
      v = createPortal(v, this.portal)
    }
    useAdd(v)
  }
  render(fun = emptyFun) {
    return this.allRender(fun)
  }
}


type JKey = keyof JSX.IntrinsicElements
type PropsS<K extends JKey> = JSX.IntrinsicElements[K] & {
  style: CSSProperties
}
export function create<K extends JKey>(
  type: K,
  props?: JSX.IntrinsicElements[K] | ((v: PropsS<K>) => PropsS<K>),
  portal?: Element
) {
  return new DomCreater<JSX.IntrinsicElements[K], K>(type)
    .attrs(props || emptyObject as any)
    .setPortal(portal)
}