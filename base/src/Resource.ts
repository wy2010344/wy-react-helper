
import { createAndFlushAbortController } from "./usePromise"
import { useStoreTriggerRender } from "./useStoreTriggerRender"
import { GetPromiseRequest, PromiseResult, quote, valueCenterOf } from "wy-helper"



export function createResource<T>(getResource: GetPromiseRequest<T>) {
  const resource = valueCenterOf<PromiseResult<T> | undefined>(undefined)
  let promise: Promise<any> | undefined = undefined
  const cancelRef = {
    current: undefined
  }
  function reloadPromise() {
    const thePromise = getResource(createAndFlushAbortController(cancelRef)).then(value => {
      if (thePromise == promise) {
        resource.set({
          type: "success",
          value
        })
      }
    }).catch(err => {
      if (thePromise == promise) {
        resource.set({
          type: "error",
          value: err
        })
      }
    })
    promise = thePromise
  }
  function useFilter<M>(filter: (v?: PromiseResult<T>) => M) {
    return useStoreTriggerRender(resource, function (v) {
      if (!promise) {
        reloadPromise()
      }
      return filter(v)
    })
  }
  return {
    useFilter,
    useAsState() {
      return useFilter(quote)
    },
    invalid() {
      resource.set(undefined)
      promise = undefined
      if (resource.poolSize()) {
        reloadPromise()
      }
    }
  }
}