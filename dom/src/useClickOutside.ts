import { useEffect } from "react"
import { emptyArray } from "wy-helper"
import { useEvent } from "wy-react-helper"
/**
 * target是否contain这个e
 * ref.current.contains(e)
 * @param contains 
 * @param click 
 */
export function useClickOutside(
  contains: (e: Node) => boolean,
  click: (e: MouseEvent) => void
) {
  const onClick = useEvent((e: MouseEvent) => {
    if (!contains(e.target as Node)) {
      click(e)
    }
  })
  useEffect(() => {
    /**
     * 在捕获阶段的,而不是冒泡阶段的,否则可能有之前一步的事件
     */
    document.addEventListener("click", onClick, true)
    return function () {
      document.removeEventListener("click", onClick, true)
    }
  }, emptyArray)
}