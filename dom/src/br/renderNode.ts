import React, { useEffect, useRef } from "react";
import { BDomEvent, DomElement, DomElementType, DomType, FChildAttr, FDomAttribute, isEvent, isSyncFun, mergeFNodeAttr, WithCenterMap } from "wy-dom-helper";
import { emptyArray, EmptyFun, emptyObject } from "wy-helper";
import { mergeRefs, ReactRef, renderList, useAdd, useConstFrom } from "wy-react-helper";
import { useKeep } from "../XDom";

const ATTR_PREFIX = "a_"
const DATA_PREFIX = "data_"
const ARIA_PREFIX = "aria_"
const S_PREFIX = "s_"
const CSS_PREFIX = "css_"

const ignoreKeys = ['children', 'childrenType']
function renderIt(type: string, args: any, ktag: DomType) {
  const ref = useRef(null)
  const list: ReactRef<any>[] = [ref]
  if (args.ref) {
    list.push(args.ref)
  }
  const props: any = {
    ref: mergeRefs(list),
    style: {}
  }
  useKeep((oldAttrs, oldDes) => {
    return mergeFNodeAttr(ref.current!, args, oldAttrs, oldDes, ktag, true)
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
      } else if (key.startsWith(DATA_PREFIX)) {
        const dataAttr = key.slice(DATA_PREFIX.length)
        props.style[`data-${dataAttr}`] = value
      } else if (key.startsWith(ARIA_PREFIX)) {
        const ariaKey = key.slice(ARIA_PREFIX.length)
        props.style[`aria-${ariaKey}`] = value
      } else if (!ignoreKeys.includes(key)) {
        props[key] = value
      }
    }
  }

  let ctx: readonly any[] = emptyArray
  if (args.childrenType == 'html') {
    props.dangerouslySetInnerHTML = {
      __html: args.children
    }
  } else if (args.childrenType == 'text') {
    ctx = [
      args.children
    ]
  } else if (args.children) {
    ctx = renderList(args.children)
  }
  props.children = ctx
  useAdd(React.createElement(type, props))
  return ref
}
export function renderDom<T extends DomElementType>(
  type: T,
  args: WithCenterMap<FDomAttribute<T>>
    & BDomEvent<T>
    & FChildAttr<React.RefObject<DomElement<T>>>
    & {
      ref?: React.Ref<DomElement<T>>
    } = emptyObject as any) {
  return renderIt(type, args, "dom")
}