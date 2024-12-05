import React, { useEffect, useRef } from "react";
import { BDomEvent, BSvgEvent, DomElementType, domTagNames, DomType, isEvent, isSyncFun, mergeXNodeAttr, Props, SvgElementType, WithCenterMap, XDomAttribute, XSvgAttribute } from "wy-dom-helper";
import { createOrProxy, emptyArray, emptyFun, EmptyFun, emptyObject, Quote, quote, SyncFun } from "wy-helper";
import { mergeRefs, useConstFrom } from "wy-react-helper";





function createSave() {
  return new CreateSave()
}
type ContentType = "html" | "text"
function updateContent(value: string, node: any, type: ContentType) {
  if (type == 'html') {
    node.innerHTML = value
  } else {
    node.textContent = value
  }
}
class CreateSave {
  des: Record<string, EmptyFun> = {}
  oldAttrs: any = emptyObject

  private desContent: EmptyFun = emptyFun
  private lastType: ContentType = undefined!
  private lastContent: string | SyncFun<string> = ''

  updateContent(
    node: any,
    type: ContentType,
    content: string | SyncFun<string>
  ) {
    if (type == this.lastType && content == this.lastContent) {
      return
    }
    this.lastType = type
    this.lastContent = content
    this.desContent()
    if (isSyncFun(content)) {
      this.desContent = content(updateContent, node, type)
    } else {
      this.desContent = emptyFun
    }
  }
  destroy() {
    for (const key in this.des) {
      this.des[key]()
    }
  }
}
export function useKeep(
  props: any,
  args: any,
  ref: React.RefObject<any>,
  merge: (oldAttrs: Props, oldDes: any) => any,
  toChildren: Quote<any> = quote
) {
  const keep = useConstFrom(createSave)
  useEffect(() => {
    keep.des = merge(keep.oldAttrs, keep.des)
  })
  useEffect(() => {
    return () => {
      keep.destroy()
    }
  }, emptyArray)
  if (args.childrenType == 'html') {
    if (isSyncFun(args.children)) {
      useEffect(() => {
        keep.updateContent(
          ref.current!,
          "html",
          args.children
        )
      })
    } else {
      props.dangerouslySetInnerHTML = {
        __html: args.children
      }
    }
  } else if (args.childrenType == 'text') {
    if (isSyncFun(args.children)) {
      useEffect(() => {
        keep.updateContent(
          ref.current!,
          "text",
          args.children
        )
      })
    } else {
      props.children = [
        args.children
      ]
    }
  } else if (args.children) {
    props.children = toChildren(args.children)
  }
  return props
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
      useKeep(props, args, ref, (oldAttrs, oldDes) => {
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