import { CSSProperties } from "wy-dom-helper"
import { emptyObject } from "wy-helper"
import React from "react"
import { DomCreater } from "./attr"

type DomElements = React.ReactHTML
export type DomElementType = keyof DomElements
export type DomAttribute<T extends DomElementType> = DomElements[T] extends React.DetailedHTMLFactory<infer Attr, any> ? Omit<Attr, 'dangerouslySetInnerHTML'> : never
export type DomElement<T extends DomElementType> = DomElements[T] extends React.DetailedHTMLFactory<any, infer N> ? N : never
export type DomAttributeS<T extends DomElementType> = Omit<DomAttribute<T>, 'style'> & {
  style: CSSProperties
}
export type DomAttributeSO<T extends DomElementType> = Omit<DomAttribute<T>, 'style'> & {
  style?: CSSProperties
}


let dom: {
  readonly [key in DomElementType]: {
    (props?: DomAttribute<key> | DomAttributeSO<key>, portal?: Node): DomCreater<DomAttribute<key>, key>
    (fun: (v: DomAttributeS<key>) => DomAttributeS<key> | void, portal?: Node): DomCreater<DomAttribute<key>, key>
  }
}

export const domTagNames: DomElementType[] = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "slot",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "template",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  "webview"
]
if ('Proxy' in globalThis) {
  const cacheDomMap = new Map<string, any>()
  dom = new Proxy(emptyObject as any, {
    get(_target, p, _receiver) {
      const oldV = cacheDomMap.get(p as any)
      if (oldV) {
        return oldV
      }
      const creater = new DomCreater(p as DomElementType)
      const newV = function (args: any, portal: any) {
        creater.attrsEffect = args
        creater.portal = portal
        return creater
      }
      cacheDomMap.set(p as any, newV)
      return newV
    }
  })
} else {
  const cacheDom = {} as any
  dom = cacheDom
  domTagNames.forEach(function (tag) {
    const creater = new DomCreater(tag)
    cacheDom[tag] = function (args: any, portal: any) {
      creater.attrsEffect = args
      creater.portal = portal
      return creater
    }
  })
}

export {
  dom
}