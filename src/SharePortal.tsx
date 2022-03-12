import React, { useEffect } from "react"
import { useOnlyId } from "./useOnlyId"
import { ValueCenter, useStoreTriggerRender } from "./ValueCenter"



export function createSharePortal() {
  const portals = new ValueCenter<JSX.Element[]>([])

  function buildDestroy(id: string, p: JSX.Element) {
    useEffect(() => {
      const ps = portals.get()
      const idx = ps.findIndex(v => v.key == id)
      if (idx < 0) {
        portals.set(ps.concat(p))
      } else {
        ps.splice(idx, 1, p)
        const vs = ps.slice()
        portals.set(vs)
      }
    }, [p])
    useEffect(function () {
      return () => {
        portals.set(portals.get().filter(v => v.key != id))
      }
    }, [])
  }
  return {
    portals,
    usePortals() {
      return useStoreTriggerRender(portals)
    },
    PortalCall({ children }: { children(i: string): JSX.Element }) {
      const { id } = useOnlyId()
      buildDestroy(id, children(id))
      return null
    },
    Portal({ children }: { children: JSX.Element }) {
      const { id } = useOnlyId()
      buildDestroy(id, { ...children, key: id })
      return null
    },
    PortalFragmet({ children }: { children: React.ReactNode }) {
      const { id } = useOnlyId()
      buildDestroy(id, <React.Fragment key={id}>
        {children}
      </React.Fragment>)
      return null
    }
  }
}