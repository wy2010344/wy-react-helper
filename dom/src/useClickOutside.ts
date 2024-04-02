import { useEffect } from "react"
import { emptyArray } from "wy-helper"
import { useEvent } from "wy-react-helper"

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
    document.addEventListener("click", onClick)
    return function () {
      document.removeEventListener("click", onClick)
    }
  }, emptyArray)
}