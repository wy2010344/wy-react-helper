import { Compare, simpleNotEqual } from "wy-helper";
import { useRefConst } from "./useRefConst";
import { valueOf } from "wy-helper/Vue";



export function useRefVueValueFrom<T>(init: () => T, shouldChange?: Compare<any>) {
  return useRefConst(() => valueOf(init(), shouldChange))
}
export function useRefVueValue<T>(init: T, shouldChange?: Compare<any>) {
  return useRefVueValueFrom(() => init, shouldChange)
}

export function useRefAtomVueValueFrom<T>(init: () => T, shouldChange: Compare<any> = simpleNotEqual) {
  return useRefConst(() => valueOf(init(), shouldChange))
}
export function useRefAtomVueValue<T>(init: T, shouldChange: Compare<any> = simpleNotEqual) {
  return useRefVueValueFrom(() => init, shouldChange)
}