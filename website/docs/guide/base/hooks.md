---
title: 基础包 Hooks
sidebar_position: 1
---

# 基础包 Hooks

基础包 `wy-react-helper` 提供了一系列不依赖特定平台的通用 React Hooks。以下是主要的 Hooks 及其用法说明。

## useEvent

一个常用的 Hook，用于创建稳定的事件处理函数，避免因为依赖项变化导致不必要的重渲染。

### 用法

```tsx
import { useEvent } from 'wy-react-helper';

function MyComponent() {
  const [count, setCount] = useState(0);
  
  // 创建一个稳定的事件处理函数
  const handleClick = useEvent(() => {
    console.log(`Count: ${count}`);
  });
  
  return <button onClick={handleClick}>Click me</button>;
}
```

## useAsyncPaginate

用于处理异步分页数据加载的 Hook。

### 用法

```tsx
import { useAsyncPaginate } from 'wy-react-helper';

function PaginatedList() {
  const {
    data,
    loading,
    error,
    page,
    setPage,
  } = useAsyncPaginate(
    async (page) => {
      // 异步获取数据
      const response = await fetch(`/api/data?page=${page}`);
      return response.json();
    },
    1, // 初始页码
    [/* 依赖项 */]
  );
  
  // 渲染逻辑...
}
```

## useRefConst

创建一个常量引用，类似于 `useRef` 但更简洁。

### 用法

```tsx
import { useRefConst } from 'wy-react-helper';

function MyComponent() {
  // 创建一个常量引用
  const myRef = useRefConst({ value: 42 });
  
  return <div>Value: {myRef.current.value}</div>;
}
```

## useChange

类似于 `useState`，但提供了更简洁的状态更新方式。

### 用法

```tsx
import { useChange } from 'wy-react-helper';

function Counter() {
  const [count, setCount] = useChange(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## usePromise

用于处理异步 Promise 操作的 Hook，提供加载状态和错误处理。

### 用法

```tsx
import { usePromise } from 'wy-react-helper';

function DataFetcher() {
  const [result, loading, error] = usePromise(
    async () => {
      const response = await fetch('/api/data');
      return response.json();
    },
    []
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Data: {JSON.stringify(result)}</div>;
}
```

## useVersion

用于跟踪组件版本的 Hook，可用于强制重新渲染。

### 用法

```tsx
import { useVersion } from 'wy-react-helper';

function VersionedComponent() {
  const [version, updateVersion] = useVersion();
  
  return (
    <button onClick={updateVersion}>
      Version: {version}
    </button>
  );
}
```

## 其他常用 Hooks

- **useAlways**: 确保回调函数总是使用最新的状态值
- **useBefore**: 在组件卸载前执行清理操作
- **useStoreTriggerRender**: 与状态存储结合使用，触发组件重新渲染
- **useAlaways**: 确保回调函数总是使用最新的状态值
- **useOnlyId**: 生成唯一 ID 的 Hook
