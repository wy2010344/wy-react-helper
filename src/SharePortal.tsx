import React, { useEffect } from "react"
import { ValueCenter, useStoreTriggerRender } from "./ValueCenter"



export function createSharePortal() {
  const portals = new ValueCenter<JSX.Element[]>([])
  let uid = 0
  return {
    uid,
    usePortals() {
      return useStoreTriggerRender(portals)
    },
    PortalCall({ children }: { children(i: number): JSX.Element }) {
      useStoreTriggerRender(portals)
      useEffect(() => {
        const id = uid++
        portals.set(portals.get().concat(children(id)))
        return () => {
          portals.set(portals.get().filter(v => v.key != id))
        }
      }, [])
      return null
    },
    Portal({ children }: { children: JSX.Element }) {
      useStoreTriggerRender(portals)
      useEffect(() => {
        const id = uid++
        portals.set(portals.get().concat({ ...children, key: id }))
        return () => {
          portals.set(portals.get().filter(v => v.key != id))
        }
      }, [])
      return null
    },
    PortalFragmet({ children }: { children: React.ReactNode }) {
      useStoreTriggerRender(portals)
      useEffect(() => {
        const id = uid++
        portals.set(portals.get().concat(<React.Fragment key={id}>
          {children}
        </React.Fragment>))
        return () => {
          portals.set(portals.get().filter(v => v.key != id))
        }
      }, [])
      return null
    }
  }
}