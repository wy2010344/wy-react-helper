import { AutoLoadMoreCore, VersionPromiseResult } from "wy-helper";
import { useEffect, useMemo } from 'react'
import { AutoLoadMoreAction, PromiseAutoLoadMore, ReadValueCenter, emptyArray, valueCenterAutoLoadMore } from 'wy-helper'
import { useStoreTriggerRender } from "./useStoreTriggerRender";

export function useAutoLoadMoreValueCenter<T, K>() {
  return useMemo(valueCenterAutoLoadMore, emptyArray) as readonly [
    ReadValueCenter<PromiseAutoLoadMore<T, K>>,
    (action: AutoLoadMoreAction<T, K>) => void
  ]
}

type GetAfterEffect<T, K> = (
  key: K,
  signal?: AbortSignal
) => Promise<AutoLoadMoreCore<T, K>>;
export function useMemoAutoLoadMore<T, K>(
  initKey: K,
  body: GetAfterEffect<T, K>,
  deps: readonly any[]
) {
  const [center, dispatch] = useAutoLoadMoreValueCenter<T, K>()
  const data = useStoreTriggerRender(center)
  useEffect(() => {
    dispatch({
      type: "reload",
      getAfter: body,
      first: initKey
    })
  }, deps)
  const cdata = data.data
  const reloading = cdata.data?.version != cdata.requestVersion
  const ndata = cdata.data
  let hasMore = false
  let list: T[] = emptyArray as T[];
  if (ndata?.type == 'success') {
    hasMore = ndata.value.hasMore
    list = ndata.value.list
  }
  return {
    data: ndata,
    loadingMore: data.isLoadingMore,
    reloading,
    hasMore,
    list,
    loadMore() {
      if (ndata) {
        dispatch({
          type: "loadMore",
          version: ndata.version
        })
      }
    },
    useWhenError(notify: (err: any, isMore?: boolean) => void) {
      useEffect(() => {
        if (ndata?.type == 'error') {
          notify(ndata.value)
        } else if (ndata?.type == 'success') {
          if (ndata.value.loadMoreError) {
            notify(ndata.value.loadMoreError, true)
          }
        }
      }, [ndata])
    }
  }
}
