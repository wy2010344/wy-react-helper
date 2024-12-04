import React, { useEffect, useRef } from "react";
import { BDomEvent, BSvgEvent, DomElementType, domTagNames, DomType, isEvent, isSyncFun, mergeXNodeAttr, Props, SvgElementType, WithCenterMap, XDomAttribute, XSvgAttribute } from "wy-dom-helper";
import { createOrProxy, emptyArray, EmptyFun, emptyObject } from "wy-helper";
import { mergeRefs, useConstFrom } from "wy-react-helper";





function createSave() {
  return {
    des: {},
    oldAttrs: emptyObject
  } as {
    des: Record<string, EmptyFun>,
    oldAttrs: any
  }
}

export function useKeep(
  merge: (oldAttrs: Props, oldDes: any) => any
) {
  const keep = useConstFrom(createSave)
  useEffect(() => {
    keep.des = merge(keep.oldAttrs, keep.des)
  })
  useEffect(() => {
    return () => {
      for (const key in keep.des) {
        keep.des[key]()
      }
    }
  }, emptyArray)
}
const ATTR_PREFIX = "a-"
const S_PREFIX = "s-"
const CSS_PREFIX = "css-"

const ignoreKeys = ['children', 'childrenType']
function create(tagNames: string[], type: DomType) {
  return createOrProxy(tagNames, function (tag) {
    return React.forwardRef(function (args: any, outRef) {
      const ref = useRef(null)
      const props: any = {
        ref: mergeRefs([outRef, ref]),
        style: {}
      }
      useKeep((oldAttrs, oldDes) => {
        return mergeXNodeAttr(ref.current!, args, oldAttrs, oldDes, type, true)
      })
      for (const key in args) {
        const value = (args as any)[key]
        const isSync = !isEvent(key) && isSyncFun(value)
        if (!isSync) {
          if (key.startsWith(ATTR_PREFIX)) {
            const attrKey = key.slice(ATTR_PREFIX.length)
            props[attrKey] = value
          } else if (key.startsWith(S_PREFIX)) {
            const styleKey = key.slice(S_PREFIX.length)
            props.style[styleKey] = value
          } else if (key.startsWith(CSS_PREFIX)) {
            const cssVariable = key.slice(CSS_PREFIX.length)
            const cssVariableKey = `--${cssVariable}`
            props.style[cssVariableKey] = value
          } else if (!ignoreKeys.includes(key)) {
            props[key] = value
          }
        }
      }

      if (args.childrenType == 'html') {

      } else if (args.childrenType == 'text') {

      } else if (args.children) {
        props.children = args.children
      }
      return React.createElement(tag, props)
    }) as any
  }) as any
}
export const Dom: {
  readonly [key in DomElementType]: {
    (
      args?: WithCenterMap<XDomAttribute<key>>
        & BDomEvent<key>
        & {
          children?: React.ReactNode
        }): JSX.Element
  }
} = create(domTagNames, 'dom')


export const Svg: {
  readonly [key in SvgElementType]: {
    (
      args?: WithCenterMap<XSvgAttribute<key>>
        & BSvgEvent<key>
        & {
          children?: React.ReactNode
        }): JSX.Element
  }
} = create(domTagNames, 'dom')