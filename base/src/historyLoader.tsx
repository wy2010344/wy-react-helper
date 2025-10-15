import {
  PairBranch,
  PairLeaf,
  PairNode,
  PairNotfound,
  TreeRoute,
} from 'wy-helper/router';
import React from 'react';
import { useCallbackPromise } from './useRenderPromise';
import { cacheGet, GetValue, quote } from 'wy-helper';

export type BranchOrLeaf =
  | PairBranch<BranchLoader, LeafLoader, NotfoundLoader>
  | PairLeaf<LeafLoader>
  | PairNotfound<NotfoundLoader>;

export type BranchLoader = {
  default(
    branch: PairBranch<BranchLoader, LeafLoader, NotfoundLoader>,
    children: React.ReactNode
  ): React.ReactNode;
};
export type LeafLoader = {
  default(branch: PairLeaf<LeafLoader>): React.ReactNode;
};
export type NotfoundLoader = {
  default(branch: PairNotfound<NotfoundLoader>): React.ReactNode;
};

export type BranchAll = PairNode<BranchLoader, LeafLoader, NotfoundLoader>;

export type Branch =
  | BranchOrLeaf
  | {
      type: 'error';
      value: any;
      loader?: never;
      query?: never;
      next?: never;
      nodes?: string[];
      index?: number;
      load?: never;
      // restNodes?: never
    };

const hasUse = (React as any)['use'];
const use =
  hasUse ||
  function (v: unknown) {
    throw '';
  };

function renderLoader(branch: BranchOrLeaf): React.ReactNode {
  /* eslint-disable */
  const value = use(branch.loader());
  if (branch.type == 'branch') {
    return (value.default as any)(branch, renderLoader(branch.next));
  } else if (branch.type == 'leaf') {
    return (value.default as any)(branch);
  } else if (branch.type == 'notfound') {
    return (value.default as any)(branch);
  }
}

const LayoutComponent: React.FC<{
  branch: BranchOrLeaf;
  renderError(v: unknown): React.ReactNode;
}> = function ({ branch, renderError }) {
  if (hasUse) {
    return renderLoader(branch);
  }
  /* eslint-disable */
  const { data } = useCallbackPromise(
    { body: branch.loader as GetValue<Promise<any>> },
    [branch.loader]
  );
  if (data?.type == 'success') {
    if (branch.type == 'branch') {
      const model = data.value as BranchLoader;
      return model.default(
        branch,
        <LayoutComponent branch={branch.next} renderError={renderError} />
      );
    } else if (branch.type == 'leaf') {
      const model = data.value as LeafLoader;
      return model.default(branch);
    } else if (branch.type == 'notfound') {
      const model = data.value as NotfoundLoader;
      return model.default(branch);
    }
  }
  if (data?.type == 'error') {
    return renderError(data.value);
  }
  return <></>;
};

export function createSimpleTree({
  prefix,
  pages,
  renderError,
}: {
  prefix: string;
  pages: Record<string, () => Promise<unknown>>;
  renderError(err: any): string;
}) {
  const tree = new TreeRoute<BranchLoader, LeafLoader, NotfoundLoader>(
    {},
    cacheGet
  );

  tree.buildFromMap(pages, prefix);
  tree.finishBuild();
  return {
    renderPath(path: string) {
      /* eslint-disable */
      const branch = React.useMemo(() => {
        try {
          const nodes = path.split('/').filter(quote);
          const out = tree.matchNodes(nodes);
          return out;
        } catch (err) {
          return {
            type: 'error',
            value: err,
          } as const;
        }
      }, [path]);

      if (branch.type == 'error') {
        return renderError(branch.value);
      }
      return <LayoutComponent branch={branch} renderError={renderError} />;
    },
  };
}
