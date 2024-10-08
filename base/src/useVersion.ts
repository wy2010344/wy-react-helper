import { useReducer } from "react";

function increase(old: number) {
  return old + 1
}
/**
 * 如果更细化定制,是否是初始化参数,步进?
 * @returns 
 */
export function useVersion() {
  const [version, setVersion] = useReducer(increase, 0);
  return [version, setVersion] as const
}


export function getOpposite(old: any) {
  return !old
}

export function useToggle(init?: any) {
  return useReducer(getOpposite, init)
}