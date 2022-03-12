import { useRef, useState } from "react"
import { useRefConst } from "../../src/useRefConst"
import { dragMoveHelper } from "./drag"
import { moveFirst, portals } from './Panel'
export default function PanelReact({
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
  const moveRef = useRefConst(function () {
    return dragMoveHelper({
      diffX(x) {
        valueLeft(left => left + x)
      },
      diffY(y) {
        valueTop(top => top + y)
      }
    })
  })
  return (
    <div ref={container} style={{
      position: 'absolute',
      border: '1px solid gray',
      width: width + 'px',
      height: height + 'px',
      left: left + 'px',
      top: top + 'px',
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
