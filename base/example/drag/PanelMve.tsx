import { useEffect, useRef, useState } from "react"
import { newLifeModel, useRefVueValue } from "../../src"
import { useRefConst } from "../../src/useRefConst"
import { dragMoveHelper } from "./drag"
import { moveFirst, portals } from './Panel'
export default function PanelMve({
  index,
  children
}: {
  index: string
  children: React.ReactNode
}, ...vschildren: any[]) {
  const [top, valueTop] = useState(100)
  const [left, valueLeft] = useState(100)
  const [width, valueWidth] = useState(400)
  const [height, valueHeight] = useState(600)
  const container = useRef<HTMLDivElement>(null)
  const movePoint = useRef<MouseEvent | undefined>(undefined)

  const moveLeft = useRefVueValue(100)
  const moveTop = useRefVueValue(100)
  const moveRef = useRefConst(function () {
    return dragMoveHelper({
      diffX(x) {
        moveLeft(moveLeft() + x)
      },
      diffY(y) {
        moveTop(moveTop() + y)
      }
    })
  })


  useEffect(function () {
    const ref = container.current
    if (!ref) return
    const goLeft = (v: number) => {
      ref.style.left = v + "px"
    }
    const goTop = (x: number) => {
      ref.style.top = x + "px"
    }
    const { me, destroy } = newLifeModel()
    me.Watch(function () {
      goLeft(moveLeft())
    })
    me.Watch(function () {
      goTop(moveTop())
    })
    return function () {
      console.log("销毁")
      destroy()
    }
  }, [])
  return (
    <div ref={container} style={{
      position: 'absolute',
      border: '1px solid gray',
      width: width + 'px',
      height: height + 'px',
      background: 'white',
      boxShadow: "grey 5px 4px 20px 8px"
    }}
      onClick={() => {
        moveFirst(index)
      }}
    >
      <div
        onMouseDown={moveRef as any}
        style={{
          height: '32px',
          cursor: 'pointer'
        }} />
      {children}
    </div>
  )
}
