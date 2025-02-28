import { useEffect, useMemo, useRef, useState } from "react";
import { useLatestRequestLoading } from "./usePromise";
import { useChange } from "./useChange";
import { useBuildSubSetObject } from "./util";
import { PromiseResult, buildPromiseResultSetData, emptyFun } from "wy-helper";
/**
 * 所有页数
 * @todo 移除直接修改状态,改为与外部进行合并
 * @param size 每页数量
 * @param count 总条数
 * @returns
 */
export function getTotalPage(size: number, count: number) {
  return Math.ceil(count / size);
}

type GetPage<T, K> = (page: K) => Promise<T>;

type PromiseResultWithPage<T, K> = PromiseResult<T> & {
  page: K;
};
function useBaseAsyncPaginate<T, K>(
  effect: (res: PromiseResultWithPage<T, K>) => void,
  initKey: K,
  getPage: GetPage<T, K>,
  /**deps里可以加version来实现刷新*/
  deps: readonly any[]
) {
  const [page, setPage] = useChange(initKey);
  const [request, loading] = useLatestRequestLoading(
    async function (
      [page]: [K]
    ): Promise<PromiseResultWithPage<T, K>> {
      const promise = getPage(page)
      try {
        const out = await promise;
        return {
          type: "success",
          page,
          promise,
          value: out,
        };
      } catch (err) {
        return {
          type: "error",
          page,
          promise,
          value: err,
        };
      }
    },
    function (res) {
      if (res.type == "success") {
        effect(res.value);
      }
    }
  );
  useEffect(() => {
    setPage(initKey);
    request(initKey);
  }, deps);
  return {
    loading,
    page,
    /**重复调用都是刷新 */
    setPage(page: K) {
      setPage(page);
      request(page);
    },
  };
}

type NormalResult<T> = {
  list: T[];
  count: number;
};
type AsyncPaginateModel<T, K> =
  | {
    page: K;
    version: number;
    data: PromiseResult<T>;
  }
  | undefined;
export function useAsyncPaginate<T>(
  {
    body,
    onError = emptyFun,
  }: {
    body: GetPage<NormalResult<T>, number>;
    onError?(err: any): void;
  },
  deps: readonly any[]
) {
  const [data, set_Data] =
    useState<PromiseResultWithPage<NormalResult<T>, number>>();
  const { page, loading, setPage } = useBaseAsyncPaginate(
    function (res) {
      set_Data(res);
      if (res.type == "error") {
        onError(res.value);
      }
    },
    1 as number,
    body,
    deps
  );
  const setData = buildPromiseResultSetData(set_Data);
  let count = 0;
  let list: T[] = [];
  const setList = useBuildSubSetObject(setData, "list");
  if (data?.type == "success") {
    count = data.value.count;
    list = data.value.list;
  }
  return {
    loading,
    list,
    count,
    page,
    setList,
    setPage,
  };
}




export function useSyncPaginate<A, T>(
  initPage: A,
  get: (page: A) => T,
  deps: readonly any[]
) {
  const [page, setPage] = useChange(initPage);
  useEffect(() => {
    setPage(initPage);
  }, deps);
  const data = useMemo(() => {
    //有可能换数据的时候,page并未变(仍然是1),导致不会加载新的,所以需要将page的依赖加上
    return get(page);
  }, [page, ...deps]);
  return {
    page,
    setPage,
    data,
  };
}
export function useListSyncPaginate<T>(
  size: number,
  get: () => T[],
  deps: readonly any[]
) {
  const allList = useMemo(() => {
    return get();
  }, deps);
  const { page, setPage, data } = useSyncPaginate(
    1,
    function (page) {
      const next = page * size;
      return allList.slice(next - size, next);
    },
    deps
  );
  return {
    allList,
    list: data,
    page,
    setPage,
    count: allList.length,
    totalPage: getTotalPage(size, allList.length),
  };
}

export function usePageChangeCall<T>(page: T, call: (i: number) => void) {
  const ref = useRef(0);
  useEffect(() => {
    call(ref.current);
    ref.current += 1;
  }, [page]);
}
