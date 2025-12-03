---
title: 基础包组件
sidebar_position: 2
---

# 基础包组件

基础包 `wy-react-helper` 提供了一些通用的 React 组件，这些组件不依赖于特定的平台（Web 或 Native）。

## SharePortal

一个强大的组件，用于在应用程序的不同部分共享和渲染内容。它允许将内容渲染到 React 应用程序的任何位置。

### 用法

```tsx
import { SharePortal, renderSharePortal } from 'wy-react-helper'
import { ValueCenter } from 'wy-helper'

// 创建一个共享的门户存储
const portalStore = new ValueCenter([])

// 在应用的顶层渲染门户容器
function App() {
  return (
    <div>
      <MainContent />
      {renderSharePortal(portalStore)}
    </div>
  )
}

// 在其他组件中使用门户
function MainContent() {
  return (
    <div>
      <button
        onClick={() => {
          // 创建一个新的门户内容
          const portalContent = new ValueCenter(
            (
              <div className="modal">
                <p>这是通过 SharePortal 渲染的内容</p>
                <button onClick={() => portalContent.set(undefined)}>
                  关闭
                </button>
              </div>
            )
          )

          // 添加到门户存储
          portalStore.set([...portalStore.get(), portalContent])
        }}
      >
        显示门户内容
      </button>
    </div>
  )
}
```

## SharePop

一个用于显示弹出内容的组件，可以控制弹出内容的显示和隐藏。

### 用法

```tsx
import { SharePop } from 'wy-react-helper'

function PopupComponent() {
  const [show, setShow] = useState(false)

  return (
    <div>
      <button onClick={() => setShow(true)}>显示弹出内容</button>

      <SharePop show={show} onClose={() => setShow(false)}>
        <div className="popup-content">
          <h2>弹出内容</h2>
          <p>这是一个弹出式组件</p>
          <button onClick={() => setShow(false)}>关闭</button>
        </div>
      </SharePop>
    </div>
  )
}
```

## HookRender

一个用于在组件外部渲染内容的 Hook 包装器组件。

### 用法

```tsx
import { HookRender } from 'wy-react-helper'

function DynamicContent() {
  return (
    <HookRender
      render={() => {
        // 这里可以使用 Hooks
        const [count, setCount] = useState(0)

        return (
          <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
          </div>
        )
      }}
    />
  )
}
```

## ShareStore

用于在组件之间共享状态的工具。

### 用法

```tsx
import { ShareStore } from 'wy-react-helper'

// 创建一个共享的存储
const counterStore = new ShareStore(0)

function CounterDisplay() {
  // 订阅状态变化
  const count = counterStore.useState()

  return <div>Count: {count}</div>
}

function CounterControls() {
  return (
    <div>
      <button onClick={() => counterStore.setState((prev) => prev + 1)}>
        Increment
      </button>
      <button onClick={() => counterStore.setState((prev) => prev - 1)}>
        Decrement
      </button>
    </div>
  )
}
```

## exitAnimate

用于处理组件退出动画的组件。

### 用法

```tsx
import { exitAnimate } from 'wy-react-helper'

function AnimatedComponent() {
  const [show, setShow] = useState(true)

  const AnimatedContent = exitAnimate(
    ({ status, style }) => (
      <div style={{ ...style, opacity: status === 'entering' ? 1 : 0 }}>
        动画内容
      </div>
    ),
    { duration: 300 }
  )

  return (
    <div>
      <button onClick={() => setShow(false)}>开始退出动画</button>
      {show && <AnimatedContent onExited={() => console.log('动画结束')} />}
    </div>
  )
}
```

## renderXML

用于渲染 XML 字符串的组件。

### 用法

```tsx
import { renderXML } from 'wy-react-helper'

function XMLRenderer() {
  const xmlString = '<div><p>这是 XML 内容</p><button>点击我</button></div>'

  return (
    <div>
      {renderXML(xmlString, {
        // 自定义标签处理
        button: (props, children) => (
          <button style={{ color: 'blue' }} {...props}>
            {children}
          </button>
        ),
      })}
    </div>
  )
}
```
