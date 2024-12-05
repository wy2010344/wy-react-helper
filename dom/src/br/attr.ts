import { EmptyFun, emptyFun, emptyObject, genTemplateStringS1 } from "wy-helper"
import { afterFreeze, lazyOrInit, TOrQuote } from "./util"
import React from "react"
import { renderList, useAdd } from "wy-react-helper"
export class DomCreater<M extends {}, T extends string> {
  static instance = new DomCreater()
  private constructor() { }
  /**
   * 其实这3个属性可以改变,
   * 因为只在最终render阶段释放.
   * 主要是portal可以改变
   * 其实attr也可以改变.只有type一开始就不再可以改变
   * @param type 
   * @param attrsEffect 
   * @param portal 
   */
  public type!: T
  public attrsEffect: TOrQuote<M> = emptyObject as any
  attrs(v: TOrQuote<M>) {
    this.attrsEffect = v
    return this
  }
  renderHtml(ts: TemplateStringsArray, ...vs: (string | number)[]) {
    return this.renderInnerHTML(genTemplateStringS1(ts, vs))
  }
  renderText(ts: TemplateStringsArray, ...vs: (string | number)[]) {
    return this.renderTextContent(genTemplateStringS1(ts, vs))
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
    const props = lazyOrInit(this.attrsEffect) || {}
    if (dangerouslySetInnerHTML) {
      props.dangerouslySetInnerHTML = dangerouslySetInnerHTML
    }
    if (ctx.length) {
      props.children = ctx
    }
    afterFreeze(props)
    useAdd(React.createElement(this.type as any, props))
  }
  render(fun = emptyFun) {
    return this.allRender(fun)
  }
}