import { AutoLoadMoreCore } from "wy-helper";
import { useCallback, useEffect, useMemo } from 'react'
import { AutoLoadMoreAction, PromiseAutoLoadMore, ReadValueCenter, emptyArray, valueCenterAutoLoadMore } from 'wy-helper'
import { useStoreTriggerRender } from "./useStoreTriggerRender";

export function useAutoLoadMoreValueCenter<T, K>() {
  return useMemo(valueCenterAutoLoadMore, emptyArray) as readonly [
    ReadValueCenter<PromiseAutoLoadMore<T, K>>,
    (action: AutoLoadMoreAction<T, K>) => void
  ]
}

type GetAfterEffect<T, K> = (
  key: K
) => Promise<AutoLoadMoreCore<T, K>>;
export function useMemoAutoLoadMore<T, K>(
  {
    from,
    getKey,
    onError
  }: {
    from: K,
    getKey?(v: T): any
    onError?(err: any, loadMore?: boolean): void
  },
  body: GetAfterEffect<T, K>,
  deps: readonly any[]
) {
  const [center, dispatch] = useAutoLoadMoreValueCenter<T, K>()
  const filter = useCallback((t: PromiseAutoLoadMore<T, K>) => {
    const cdata = t.data.data
    if (cdata?.type == 'error') {
      onError?.(cdata.value)
    }
    if (cdata?.type == 'success' && cdata.value.loadMoreError) {
      onError?.(cdata.value.loadMoreError, true)
    }
    return t
  }, emptyArray)
  const data = useStoreTriggerRender(center, { filter })

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
    updateData(callback: T[] | ((old: T[]) => T[])) {
      dispatch({
        type: "update",
        callback: typeof callback == 'function' ? callback : () => callback
      })
    },
    refresh(call: () => Promise<AutoLoadMoreCore<T, K>>) {
      dispatch({
        type: "refersh",
        call
      })
    }
  }
}
