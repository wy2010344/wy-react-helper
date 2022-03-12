import { createSharePortal, ValueCenter } from "../../src"


const { Portal, PortalCall, usePortals, portals } = createSharePortal()
export { Portal, PortalCall, usePortals, portals }

export const shareCount = new ValueCenter(0)


export function moveFirst(id: string) {
  const vs = portals.get()
  const idx = vs.findIndex(v => v.key == id)
  if (idx < 0) {
    console.log("出现了什么事？", vs.map(v => v.key).join("|"))
  } else {
    const [d] = vs.splice(idx, 1)
    portals.set(vs.concat(d))
  }
}