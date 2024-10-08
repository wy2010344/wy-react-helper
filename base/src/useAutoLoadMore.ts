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
  {
    from,
    getKey,
  }: {
    from: K,
    getKey?(v: T): any
  },
  body: GetAfterEffect<T, K>,
  deps: readonly any[]
) {
  const [center, dispatch] = useAutoLoadMoreValueCenter<T, K>()
  const data = useStoreTriggerRender(center)
  useEffect(() => {
    dispatch({
      type: "reload",
      getAfter: body,
      first: from,
      getKey
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
    updateData(callback: (old: T[]) => T[]) {
      dispatch({
        type: "update",
        callback
      })
    },
    refresh(call: (abort?: AbortSignal) => Promise<AutoLoadMoreCore<T, K>>) {
      dispatch({
        type: "refersh",
        call
      })
    },
    useWhenError(notify: (err: any, isMore?: boolean) => void) {
      let error = ndata?.type == 'error' ? ndata.value : undefined
      let loadMoreError = ndata?.type == 'success' ? ndata.value.loadMoreError : undefined
      useEffect(() => {
        notify(error)
      }, [error])
      useEffect(() => {
        notify(loadMoreError)
      }, [loadMoreError])
    }
  }
}
