import { CSSProperties } from "wy-dom-helper"
import { DomCreater } from "./attr"
import { emptyObject } from "wy-helper"
import { SVGAttributes } from "react"

type SvgElements = React.ReactSVG
export type SvgElementType = keyof SvgElements
export type SvgElement<T extends SvgElementType> = JSX.IntrinsicElements[T] extends React.SVGProps<infer N> ? N : never
export type SvgAttribute<T extends SvgElementType> = SVGAttributes<SvgElement<T>>

export type SvgAttributeS<T extends SvgElementType> = Omit<SvgAttribute<T>, 'style'> & {
  style: CSSProperties
}
export type SvgAttributeSO<T extends SvgElementType> = Omit<SvgAttribute<T>, 'style'> & {
  style?: CSSProperties
}


export const svgTagNames: SvgElementType[] = [
  "svg",
  "animate",
  "circle",
  "clipPath",
  "defs",
  "desc",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "metadata",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "stop",
  "switch",
  "symbol",
  "text",
  "textPath",
  "tspan",
  "use",
  "view"
]
let svg: {
  readonly [key in SvgElementType]: {
    (props?: SvgAttribute<key> | SvgAttributeSO<key>, portal?: Node): DomCreater<SvgAttribute<key>, key>
    (fun: (v: SvgAttributeS<key>) => SvgAttributeS<key> | void, portal?: Node): DomCreater<SvgAttribute<key>, key>
  }
}
if ('Proxy' in globalThis) {
  const cacheSvgMap = new Map<string, any>()
  svg = new Proxy(emptyObject as any, {
    get(_target, p, _receiver) {
      const oldV = cacheSvgMap.get(p as any)
      if (oldV) {
        return oldV
      }
      const creater = new DomCreater(p as any)
      const newV = function (args: any, portal: any) {
        creater.attrsEffect = args
        creater.portal = portal
        return creater
      }
      cacheSvgMap.set(p as any, newV)
      return newV
    }
  })
} else {
  const cacheSvg = {} as any
  svg = cacheSvg
  svgTagNames.forEach(function (tag) {
    const creater = new DomCreater(tag as any)
    cacheSvg[tag] = function (args: any, portal: any) {
      creater.attrsEffect = args
      creater.portal = portal
      return creater
    }
  })
}

export {
  svg
}