import { Reducer, useCallback, useEffect, useReducer, useRef } from "react"
import { useEvent } from "./useEvent"
import { createAndFlushAbortController } from "./usePromise"
import { useAlaways } from "./useAlaways"
import { useVersionLock } from "./Lock"
import { PromiseResult, emptyFun } from "wy-helper"
export type LoadAfterResult<T, K> = {
  list: T[];
  nextKey: K;
  hasMore: boolean;
};
type GetAfter<T, K> = (key: K) => Promise<LoadAfterResult<T, K>>;

type GetAfterEffect<T, K> = (
  key: K,
  signal?: AbortSignal
) => Promise<LoadAfterResult<T, K>>;
type AutoLoadMoreModel<T, K> =
  | {
    getAfter: GetAfter<T, K>;
    data: PromiseResult<
      LoadAfterResult<T, K> & {
        /**最新一次加载更多,可能是失败 */
        loadMoreError?: any;
        version: number;
      }
    >;
  }
  | undefined;
type AutoLoadMoreAction<T, K> =
  | AutoLoadMoreActionReload<T, K>
  | AutoLoadMoreActionLoadMore<T, K>
  | {
    type: "update";
    callback: UpdateCallBack<T>;
  };
type UpdateCallBack<T> = ((old: T[]) => T[]) | T[];
type AutoLoadMoreActionReload<T, K> = {
  type: "reload";
  getAfter: GetAfter<T, K>;
  data: PromiseResult<LoadAfterResult<T, K> & {
    version: number
  }>;
};
type AutoLoadMoreActionLoadMore<T, K> = {
  type: "loadMore";
  fromKey: K;
  version: number
  getAfter: GetAfter<T, K>;
  data: PromiseResult<LoadAfterResult<T, K>>;
};
function reducerAutoLoadMore<T, K>(
  old: AutoLoadMoreModel<T, K>,
  action: AutoLoadMoreAction<T, K>
): AutoLoadMoreModel<T, K> {
  if (action.type == "reload") {
    return {
      getAfter: action.getAfter,
      data: action.data,
    };
  } else if (action.type == "loadMore") {
    if (
      old &&
      old.data.type == "success" &&
      old.getAfter == action.getAfter &&
      old.data.value.nextKey == action.fromKey
    ) {
      const version = action.version
      return {
        ...old,
        data: {
          ...old.data,
          value:
            action.data.type == "success"
              ? {
                ...action.data.value,
                list: old.data.value.list.concat(action.data.value.list),
                loadMoreError: undefined,
                version,
              }
              : {
                ...old.data.value,
                loadMoreError: action.data.value,
                version,
              },
        },
      };
    }
  } else if (action.type == "update") {
    if (old && old.data.type == "success") {
      return {
        ...old,
        data: {
          ...old.data,
          value: {
            ...old.data.value,
            list:
              typeof action.callback == "function"
                ? action.callback(old.data.value.list)
                : action.callback,
          },
        },
      };
    }
  }
  debugLog("更新失败", action);
  return old;
}
/**
 *
 * T 列表类型
 * K 键类型
 * @todo 移除外部修改状态,改为合并
 * @param effect 获得列表的函数
 * @param deps 需要更新的函数
 * @returns
 */
export function useAutoLoadMore<T, K>(
  effect: GetAfterEffect<T, K>,
  deps: readonly any[]
) {
  const [data, dispatch] = useReducer<Reducer<AutoLoadMoreModel<T, K>, AutoLoadMoreAction<T, K>>>(
    reducerAutoLoadMore,
    undefined
  );
  const lastCancelRef = useRef<() => void>()
  const getAfter = useCallback((k: K) => {
    return effect(k, createAndFlushAbortController(lastCancelRef))
  }, deps);
  const judge = useAlaways({
    shouldDispatchReload(version: number, oldGetAfter: GetAfter<T, K>) {
      return version == lockVersionRef.current && getAfter == oldGetAfter;
    },
    shouldDispatchLoadMore(version: number, oldGetAfter: GetAfter<T, K>, nextKey: K) {
      if (data?.data.type == "success") {
        return version == lockVersionRef.current && getAfter == oldGetAfter && nextKey == data.data.value.nextKey;
      }
      return false;
    },
  });
  //加载锁
  const [lockVersionRef, updateLockVersion] = useVersionLock(1)
  return {
    reloading: getAfter != data?.getAfter,
    data: data?.data,
    reload: useEvent(async function (initKey: K, whenError = emptyFun) {
      const version = updateLockVersion()
      let action: AutoLoadMoreActionReload<T, K>;
      try {
        const value = await getAfter(initKey);
        action = {
          type: "reload",
          getAfter,
          data: {
            type: "success",
            value: {
              ...value,
              version
            },
          },
        };
      } catch (err) {
        action = {
          type: "reload",
          getAfter,
          data: {
            type: "error",
            value: err
          },
        };
      }
      if (judge.current.shouldDispatchReload(version, getAfter)) {
        dispatch(action);
        if (action.data.type == "error") {
          whenError(action.data.value);
        }
        return action;
      }
    }),
    loadMore: useEvent(function (whenError = emptyFun) {
      debugLog("触发更新", lockVersionRef.current);
      if (data?.data.type == "success" && data.data.value.hasMore) {
        if (lockVersionRef.current != data.data.value.version) {
          return;
        }
        const version = updateLockVersion()
        const getAfter = data.getAfter;
        const nextKey = data.data.value.nextKey;
        return didGetAfter(getAfter, nextKey, version).then((value) => {
          if (judge.current.shouldDispatchLoadMore(version, getAfter, nextKey)) {
            dispatch(value);
            if (value.data.type == "error") {
              whenError(value.data.value);
            }
            return value;
          }
        });
      }
    }),
    setList: useEvent(function (callback: UpdateCallBack<T>) {
      dispatch({
        type: "update",
        callback,
      });
    })
  }
}

async function didGetAfter<T, K>(getAfter: GetAfter<T, K>, fromKey: K, version: number) {
  let action: AutoLoadMoreActionLoadMore<T, K>;
  try {
    const value = await getAfter(fromKey);
    action = {
      type: "loadMore",
      getAfter,
      fromKey,
      version,
      data: {
        type: "success",
        value: value,
      },
    };
  } catch (err) {
    action = {
      type: "loadMore",
      getAfter,
      fromKey,
      version,
      data: {
        type: "error",
        value: err,
      },
    };
  }
  return action;
}

export function useMemoAutoLoadMore<T, K>({
  initKey,
  body,
}: {
  initKey: K;
  body: GetAfterEffect<T, K>;
}, deps: readonly any[]) {
  const { data, reload, reloading, loadMore, setList } = useAutoLoadMore(body, deps);
  useEffect(() => {
    reload(initKey)
  }, deps);

  let loadMoreVersion = 0;
  let hasMore = false;
  let list: T[] = [];
  if (data?.type == "success") {
    loadMoreVersion = data.value.version || 0;
    hasMore = data.value.hasMore;
    list = data.value.list;
  }
  return {
    reloading,
    list,
    hasMore,
    loadMore,
    loadMoreVersion,
    setList,
  };
}
function debugLog(...vs: [any?, ...any[]]) {
  console.log.apply(console, vs);
}