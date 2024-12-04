import { CSSProperties, svgTagNames } from "wy-dom-helper"
import { DomCreater } from "./attr"
import { createOrProxy, emptyObject } from "wy-helper"
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

export const svg: {
  readonly [key in SvgElementType]: {
    (props?: SvgAttribute<key> | SvgAttributeSO<key>, portal?: Node): DomCreater<SvgAttribute<key>, key>
    (fun: (v: SvgAttributeS<key>) => SvgAttributeS<key> | void, portal?: Node): DomCreater<SvgAttribute<key>, key>
  }
} = createOrProxy(svgTagNames, function (tag) {
  return function (args: any) {
    const creater = DomCreater.instance
    creater.type = tag
    creater.attrsEffect = args
    return creater
  }
}) as any