# wy-react-helper 路由系统

wy-react-helper 提供基于目录结构的文件路由系统，通过 `createSimpleTree` 实现自动路由映射。

## 基础配置

### 项目设置

```typescript
// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserHistory } from 'history'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// history.ts
import { Action, createBrowserHistory, Update } from 'history'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ReadURLSearchParam } from 'wy-dom-helper'
import { emptyArray } from 'wy-helper'

export const history = createBrowserHistory()

const HistoryContext = createContext<{
  pathname: string
  action: Action
  hash: string
  search: ReadURLSearchParam
  beforeHref: string
}>(undefined as any)
export function useLocation() {
  const ctx = useContext(HistoryContext)
  if (ctx) {
    return ctx
  }

  const beforeHref = useRef<string>(undefined)
  const [state, setState] = useState<Update>(history)

  useEffect(() => {
    let cacheHref = location.href
    return history.listen((value) => {
      beforeHref.current = cacheHref
      cacheHref = location.href
      setState(value)
    })
  }, emptyArray)

  return useMemo(() => {
    let pathname = decodeURI(state.location.pathname)
    if (pathname.startsWith('/')) {
      pathname = pathname.slice(1)
    }

    return {
      beforeHref: beforeHref.current,
      pathname,
      action: state.action,
      hash: state.location.hash,
      search: new URLSearchParams(state.location.search) as ReadURLSearchParam,
    }
  }, [state])
}

// App.tsx
import { createSimpleTree } from 'wy-react-helper'
import { useLocation } from './history'
const argForceNumber = function (n: string) {
  if (!n) {
    throw new Error('不允许省略')
  }
  const x = Number(n)
  if (isNaN(x)) {
    throw new Error(`not a number ${n}`)
  }
  return x
}

const pages = import.meta.glob('./pages/**')
const { renderPath } = createSimpleTree({
  treeArg: {
    number: argForceNumber, // 路径参数类型转换
  },
  aliasMap: {
    //路由映射功能，有以下两种格式
    '/nest-route-demo/[x]/bb'(args) {
      return `/nest-route-demo/bb-${args.x}`
    },
    'bbb-[x]': 'xxx-[x]-bbb',
  },
  pages,
  prefix: './pages/',
  renderError(err) {
    return `error:${err}`
  },
})
function App() {
  const { pathname } = useLocation()
  return renderPath(pathname)
}

export default App
```

## 目录结构

### 路由结构

```
src/pages/
├── 1.bb-[a-number]
│   └── index.ts
├── 2.bb-[a]
│   └── index.ts
├── user/
│   ├── index.ts                    # /user
│   └── [id]/
│       └── index.ts                # /user/:id
├── group/
│   └── [id]/
│       ├── index.ts                # /group/:id
│       └── edit
|           └── index.ts            # /group/:id/edit
└── blog/
    └── [year-number]/
        ├── default.ts              # /blog/下没有找到的路由节点，都转到这里，也享有layout.ts
        ├── layout.ts               # /blog/:year及后缀路由节点共享的布局
        ├── index.ts                # /blog/:year
        └── [month-number]/
            └── index.ts            # /blog/:year/:month 其中year与month的参数需要经过注入的number函数校验，成功才能进入
```

上述中，`1.bb-[a-number]`对应 bb-98 这种路由，当路由节点使用`1.`,`2.`这样开头时，表示使用前面的数字从小到大排序。
`a-number`中，number，即是最开始注入 treeArg 的 number 方法，校验参数是否为数字。

## 页面组件

### 叶子页面 (Leaf)

```tsx
// pages/about/index.tsx
import React from 'react'
import type { PairLeaf } from 'wy-helper/router'

export default function (e: PairLeaf<any>) {
  return <Component />
}
const Component: React.FC<{}> = function () {
  return <div>关于我们</div>
}
```

注意

1. export default 是一个参数是 `PairLeaf<any>`函数，而不是 react 的组件，里面不能放 hooks。
2. 叶子页面必须在 index.tsx，如上的路由就是 `/about`,而不能是`pages/about.tsx`

### 布局页面 (Branch)

```typescript
// pages/home/layout.tsx
import React from 'react'
import type { PairBranch } from 'wy-helper/router'

export default function (
  e: PairBranch<any, any, any>,
  children: React.ReactNode
) {
  return <Component>{children}</Component>
}

const Component: React.FC<{
  children?: React.ReactNode
}> = function ({ children }) {
  return (
    <div className="home-layout">
      {/* 导航栏 */}
      <nav>
        <a href="/home/dashboard">仪表板</a>
        <a href="/home/settings">设置</a>
      </nav>

      {/* 子路由内容 */}
      <main>{children}</main>
    </div>
  )
}
```

注意

1. export default 是一个参数是 `PairBranch<any, any, any>,React.ReactNode`函数，而不是 react 的组件，里面不能放 hooks。
2. 而已页面必须在 layout.tsx 如`pages/home/layout.tsx`,则`pages/home/index.tsx`，`pages/home/default.tsx`, `pages/home/...`下的路由，都被这个布局包围，没有例外。除非 aliasMap 声明映射，可以避开它。

### 默认页面(Default)

未找到的路由跳转处

```tsx
// pages/default.tsx
import React from 'react'
import type { PairNotfound } from 'wy-helper/router'

export default function (e: PairNotfound<any>) {
  return <Component />
}

const Component: React.FC<{}> = function () {
  return (
    <div>
      <h1>404 - 页面未找到</h1>
      <a href="/">返回首页</a>
    </div>
  )
}
```

注意

与前面二者类似

### 动态路由参数

```typescript
// pages/user/[id]/index.tsx
import React from 'react'
import { useLocation } from '../../history'

export default function (e: PairNotfound<any>) {
  // 从branch中获取动态路由参数
  const id = branch.query?.id || ''
  return <Component />
}
const Component: React.FC<{}> = function () {
  // 或者从URL查询参数中获取
  const { search } = useLocation()
  const queryId = search.get('id') || ''
  return (
    <div>
      <h1>用户 ID: {id}</h1>
      <h1>查询 ID: {queryId}</h1>
    </div>
  )
}
```
