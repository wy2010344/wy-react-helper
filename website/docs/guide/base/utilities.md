---
title: 基础包工具函数
sidebar_position: 3
---

# 基础包工具函数

基础包 `wy-react-helper` 提供了一些通用的工具函数，这些函数可以在任何 React 环境中使用。

## ValueCenter

一个轻量级的状态容器，用于在组件之间共享和管理状态。

### 用法

```tsx
import { ValueCenter } from 'wy-react-helper';

// 创建一个值中心
const counter = new ValueCenter(0);

// 获取当前值
const currentValue = counter.get(); // 0

// 设置新值
counter.set(1);

// 使用函数更新值
counter.set(prev => prev + 1);

// 订阅值的变化
const unsubscribe = counter.listen(newValue => {
  console.log('New value:', newValue);
});

// 取消订阅
unsubscribe();
```

## mergeRefs

合并多个 React refs 为一个，方便同时使用多个 ref。

### 用法

```tsx
import { mergeRefs } from 'wy-react-helper';

function MyComponent() {
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  
  // 创建一个合并后的 ref
  const mergedRef = mergeRefs(ref1, ref2);
  
  return <div ref={mergedRef}>这个 div 可以通过两个 ref 访问</div>;
}
```

## animateValue

用于创建数值动画的工具函数。

### 用法

```tsx
import { animateValue } from 'wy-react-helper';

function AnimateExample() {
  const [value, setValue] = useState(0);
  
  const startAnimation = () => {
    // 从当前值动画到 100，持续 1000ms
    const animation = animateValue(
      value, // 起始值
      100,   // 结束值
      1000,  // 持续时间（毫秒）
      newValue => setValue(newValue) // 更新回调
    );
    
    // 动画完成时的回调
    animation.then(() => {
      console.log('Animation completed');
    });
    
    // 可以随时取消动画
    // animation.cancel();
  };
  
  return (
    <div>
      <div>Value: {value.toFixed(2)}</div>
      <button onClick={startAnimation}>开始动画</button>
    </div>
  );
}
```

## reorder

用于重新排序数组元素的工具函数。

### 用法

```tsx
import { reorder } from 'wy-react-helper';

const originalArray = ['a', 'b', 'c', 'd'];

// 将索引 1 的元素（'b'）移动到索引 3 的位置
const newArray = reorder(originalArray, 1, 3);
// 结果: ['a', 'c', 'd', 'b']
```

## Lock

一个简单的锁机制，用于防止并发操作。

### 用法

```tsx
import { Lock } from 'wy-react-helper';

const lock = new Lock();

async function criticalOperation() {
  // 获取锁
  await lock.acquire();
  
  try {
    // 执行需要同步的操作
    await someAsyncTask();
  } finally {
    // 释放锁
    lock.release();
  }
}

// 多次调用，只有第一个会立即执行，后续调用会排队等待
criticalOperation();
criticalOperation();
criticalOperation();
```

## signal

一个简单的信号机制，用于组件间通信。

### 用法

```tsx
import { signal } from 'wy-react-helper';

// 创建一个信号
const mySignal = signal<{ message: string }>();

// 订阅信号
const unsubscribe = mySignal.subscribe(data => {
  console.log('Received signal:', data);
});

// 触发信号
mySignal.emit({ message: 'Hello world!' });

// 取消订阅
unsubscribe();
```

## optimistic

用于实现乐观更新的工具函数。

### 用法

```tsx
import { optimistic } from 'wy-react-helper';

function updateItem(id: string, newValue: string) {
  const store = getStore();
  
  // 执行乐观更新
  const rollback = optimistic(
    () => {
      // 乐观更新逻辑
      store.updateItem(id, newValue);
    },
    () => {
      // 回滚逻辑
      store.restoreItem(id);
    }
  );
  
  // 执行实际的异步操作
  api.updateItem(id, newValue)
    .catch(() => {
      // 失败时回滚
      rollback();
    });
}
```

## historyLoader

用于加载历史记录的工具函数。

### 用法

```tsx
import { historyLoader } from 'wy-react-helper';

const loader = historyLoader(
  async (params) => {
    // 加载数据的异步函数
    const response = await fetch(`/api/history?page=${params.page}`);
    return response.json();
  },
  {
    initialPage: 1,
    pageSize: 20
  }
);

// 加载第一页
loader.load().then(data => {
  console.log('Loaded data:', data);
});

// 加载下一页
loader.loadMore().then(data => {
  console.log('Loaded more data:', data);
});

// 刷新数据
loader.refresh().then(data => {
  console.log('Refreshed data:', data);
});
```