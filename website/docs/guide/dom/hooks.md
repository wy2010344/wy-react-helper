---
title: DOM包 Hooks
sidebar_position: 1
---

# DOM包 Hooks

DOM 包 `wy-react-dom-helper` 提供了一系列与 Web DOM 相关的 React Hooks，这些 Hooks 只能在浏览器环境中使用。

## useClickOutside

检测点击事件是否发生在指定元素外部的 Hook。

### 用法

```tsx
import { useClickOutside } from 'wy-react-dom-helper';
import { useRef } from 'react';

function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 当点击下拉菜单外部时关闭菜单
  useClickOutside(
    (node) => {
      // 判断点击的节点是否在下拉菜单内部
      return dropdownRef.current?.contains(node) || false;
    },
    () => {
      // 点击外部时执行的回调
      if (isOpen) {
        setIsOpen(false);
      }
    }
  );
  
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle Dropdown</button>
      {isOpen && (
        <div ref={dropdownRef} className="dropdown-menu">
          <p>Dropdown content</p>
        </div>
      )}
    </div>
  );
}
```

## useMatchMedia

使用 CSS media queries 的 Hook，用于响应窗口尺寸变化。

### 用法

```tsx
import { useMatchMedia } from 'wy-react-dom-helper';

function ResponsiveComponent() {
  // 检测是否是移动设备视图（屏幕宽度小于 768px）
  const isMobile = useMatchMedia('(max-width: 767px)');
  
  // 检测是否是暗色模式
  const isDarkMode = useMatchMedia('(prefers-color-scheme: dark)');
  
  return (
    <div>
      <p>当前视图: {isMobile ? '移动设备' : '桌面设备'}</p>
      <p>颜色模式: {isDarkMode ? '暗色' : '亮色'}</p>
    </div>
  );
}
```

## useOnLine

检测网络连接状态的 Hook。

### 用法

```tsx
import { useOnLine } from 'wy-react-dom-helper';

function NetworkStatus() {
  const isOnline = useOnLine();
  
  return (
    <div className={isOnline ? 'online' : 'offline'}>
      网络状态: {isOnline ? '已连接' : '已断开'}
    </div>
  );
}
```

## useDimension

获取元素尺寸信息的 Hook。

### 用法

```tsx
import { useDimension } from 'wy-react-dom-helper';
import { useRef } from 'react';

function ElementSize() {
  const elementRef = useRef<HTMLDivElement>(null);
  const dimension = useDimension(elementRef);
  
  return (
    <div>
      <div 
        ref={elementRef} 
        style={{ width: '100%', height: '200px', backgroundColor: '#f0f0f0' }}
      >
        调整窗口大小查看尺寸变化
      </div>
      {dimension && (
        <div>
          <p>宽度: {dimension.width}px</p>
          <p>高度: {dimension.height}px</p>
          <p>顶部: {dimension.top}px</p>
          <p>左侧: {dimension.left}px</p>
        </div>
      )}
    </div>
  );
}
```

## useContentEditable

用于处理 contenteditable 元素的 Hook，提供类似受控组件的功能。

### 用法

```tsx
import { useContentEditable } from 'wy-react-dom-helper';
import { useRef } from 'react';

function RichTextEditor() {
  const [content, setContent] = useState('<p>Hello, world!</p>');
  const editableRef = useRef<HTMLDivElement>(null);
  
  useContentEditable(
    editableRef,
    content,
    (newContent) => {
      // 当内容变化时更新状态
      setContent(newContent);
    },
    {
      // 配置选项
      tagName: 'div',
      onBlur: () => console.log('Blur event'),
      onFocus: () => console.log('Focus event'),
    }
  );
  
  return (
    <div>
      <div
        ref={editableRef}
        contentEditable
        style={{ minHeight: '100px', border: '1px solid #ccc', padding: '8px' }}
      />
      <div>
        <h3>HTML 内容:</h3>
        <pre>{content}</pre>
      </div>
    </div>
  );
}
```

## useTransitionValue

用于创建平滑过渡值的 Hook，适用于数值、颜色等的平滑变化。

### 用法

```tsx
import { useTransitionValue } from 'wy-react-dom-helper';

function SmoothTransition() {
  const [targetValue, setTargetValue] = useState(0);
  
  // 创建一个平滑过渡的数值
  const transitionValue = useTransitionValue(
    targetValue, // 目标值
    { 
      duration: 300, // 过渡持续时间（毫秒）
      ease: 'easeInOut', // 缓动函数
    }
  );
  
  return (
    <div>
      <input
        type="range"
        min="0"
        max="100"
        value={targetValue}
        onChange={(e) => setTargetValue(parseInt(e.target.value))}
      />
      <div style={{ 
        width: `${transitionValue}%`, 
        height: '20px', 
        backgroundColor: 'blue' 
      }} />
      <p>当前值: {transitionValue.toFixed(2)}</p>
    </div>
  );
}
```

## useBigSpin

用于大转盘或轮播效果的 Hook。

### 用法

```tsx
import { useBigSpin } from 'wy-react-dom-helper';

function WheelSpinner() {
  const [spin, spinning, reset] = useBigSpin(
    6, // 扇区数量
    3000, // 旋转持续时间（毫秒）
    () => {
      console.log('旋转开始');
    },
    (result) => {
      console.log('旋转结束，结果:', result);
    }
  );
  
  return (
    <div>
      <button onClick={() => spin(Math.floor(Math.random() * 6))} disabled={spinning}>
        {spinning ? '旋转中...' : '开始旋转'}
      </button>
      <button onClick={reset}>重置</button>
      <div style={{ position: 'relative', width: '200px', height: '200px', marginTop: '20px' }}>
        {/* 这里可以放置转盘的 UI 实现 */}
      </div>
    </div>
  );
}
```