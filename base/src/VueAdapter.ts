import { useRefConst } from "./useRefConst";
import { notEqualChange, ShouldChange, valueOf } from "wy-helper/Vue";



export function useRefVueValueFrom<T>(init: () => T, shouldChange?: ShouldChange<any>) {
  return useRefConst(() => valueOf(init(), shouldChange))
}
export function useRefVueValue<T>(init: T, shouldChange?: ShouldChange<any>) {
  return useRefVueValueFrom(() => init, shouldChange)
}

export function useRefAtomVueValueFrom<T>(init: () => T, shouldChange: ShouldChange<any> = notEqualChange) {
  return useRefConst(() => valueOf(init(), shouldChange))
}
export function useRefAtomVueValue<T>(init: T, shouldChange: ShouldChange<any> = notEqualChange) {
  return useRefVueValueFrom(() => init, shouldChange)
}