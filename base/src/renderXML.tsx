

import React from 'react'
import { GetDefine, XMLParams, getRenderXMLFun } from 'wy-helper/tokenParser'

export type RenderFun<T> = (arg: XMLParams<T>) => T
export type MapDefine<T> = {
  [key in string]: string | number | T | RenderFun<T>
}
function mapToSingle<T>(defMap: MapDefine<T>): GetDefine<T> {
  return function (tag, value) {
    const def = defMap[tag]
    if (typeof (def) == 'function') {
      return (def as any)(value)
    } else {
      return def
    }
  }
}
const renderXML2StrJoin = getRenderXMLFun<string | number>(function (vs) {
  return vs.join('')
})
export function renderXML2Str(value: string, def?: MapDefine<string | number>) {
  if (def) {
    return renderXML2StrJoin(value, mapToSingle(def))
  } else {
    return value
  }
}

const renderXML2RenderJoin = getRenderXMLFun<React.ReactNode>(function (vs) {
  return React.createElement(React.Fragment, {}, ...vs)
})

export function renderXML2Rc(value: string, def?: MapDefine<React.ReactNode>): React.ReactNode {
  if (def) {
    return renderXML2RenderJoin(value, mapToSingle(def))
  } else {
    return value
  }
}