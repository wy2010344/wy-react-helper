import { useEffect } from "react"
import { emptyArray, useChange } from "wy-react-helper"



export function useOnLine() {
  const [onLine, setOnLine] = useChange(navigator.onLine)
  useEffect(() => {
    function onLineFun() {
      setOnLine(true)
    }
    function offLineFun() {
      setOnLine(false)
    }
    window.addEventListener("online", onLineFun)
    window.addEventListener("offline", offLineFun)
    return function () {
      window.removeEventListener("online", onLineFun)
      window.removeEventListener("offline", offLineFun)
    }
  }, emptyArray)
  return onLine
}