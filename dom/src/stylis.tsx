import { useEffect, useMemo } from 'react'
import { CSSParamType, CssNest, createBodyStyleTag, genCSS, genCssMap } from 'wy-dom-helper'
import { emptyArray } from 'wy-helper'


export function useCss(ts: TemplateStringsArray, ...vs: CSSParamType[]) {
  const css = genCSS(ts, vs)
  return useCssMap(css)
}
function useDeleteStyle(style: HTMLStyleElement) {
  useEffect(() => {
    return function () {
      style.remove()
    }
  }, emptyArray)
}
export function useCssMap<T extends CssNest>(map: T, split?: string) {
  const style = useMemo(createBodyStyleTag, emptyArray)
  const { css, classMap } = genCssMap(map, style.id, split)
  useEffect(() => {
    style.textContent = css
  }, [css])
  useDeleteStyle(style)
  return classMap
}