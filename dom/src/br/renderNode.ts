import React, { useRef } from "react";
import { BDomEvent, DomElement, DomElementType, FMergeChildAttr, FDomAttribute, isEvent, isSyncFun, mergeFDomAttr, WithCenterMap } from "wy-dom-helper";
import { EmptyFun, emptyObject, SetValue, SyncFun } from "wy-helper";
import { mergeRefs, ReactRef, renderList, useAdd } from "wy-react-helper";
import { useKeep } from "../XDom";

const ATTR_PREFIX = "a_"
const DATA_PREFIX = "data_"
const ARIA_PREFIX = "aria_"
const S_PREFIX = "s_"
const CSS_PREFIX = "css_"

const ignoreKeys = ['children', 'childrenType']

function renderListSV(fun: EmptyFun) {
  const ctx = renderList(fun)
  if (ctx.length) {
    return ctx
  }
  return undefined
}
function renderIt(type: string, args: any, merge: typeof mergeFDomAttr) {
  const ref = useRef(null)
  const list: ReactRef<any>[] = [ref]
  if (args.ref) {
    list.push(args.ref)
  }
  const props: any = {
    ref: mergeRefs(list),
    style: {}
  }
  useKeep(props, args, ref, (oldAttrs, oldDes) => {
    return merge(ref.current!, args, oldAttrs, oldDes, ignoreKeys, true)
  }, renderListSV)
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
        props[`data-${dataAttr}`] = value
      } else if (key.startsWith(ARIA_PREFIX)) {
        const ariaKey = key.slice(ARIA_PREFIX.length)
        props[`aria-${ariaKey}`] = value
      } else if (!ignoreKeys.includes(key)) {
        props[key] = value
      }
    }
  }
  useAdd(React.createElement(type, props))
  return ref
}
export function renderDom<T extends DomElementType>(
  type: T,
  args: WithCenterMap<FDomAttribute<T>>
    & BDomEvent<T>
    & FMergeChildAttr<React.RefObject<DomElement<T>>>
    & {
      ref?: React.Ref<DomElement<T>>
    } = emptyObject as any) {
  return renderIt(type, args, mergeFDomAttr)
}