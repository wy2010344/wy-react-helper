---
title: DOM包工具函数
sidebar_position: 2
---

# DOM包工具函数

DOM 包 `wy-react-dom-helper` 提供了一系列与 Web DOM 相关的工具函数，这些函数只能在浏览器环境中使用。

## stylis

一个轻量级的 CSS-in-JS 样式处理工具，类似于 styled-components 的简化版本。

### 用法

```tsx
import { stylis } from 'wy-react-dom-helper';

// 创建一个样式化的组件
const Button = stylis('button')`
  background-color: ${props => props.primary ? 'blue' : 'gray'};
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

function App() {
  return (
    <div>
      <Button>普通按钮</Button>
      <Button primary>主要按钮</Button>
    </div>
  );
}
```

## XDom

提供了一系列 DOM 操作的实用函数。

### 用法

```tsx
import { XDom } from 'wy-react-dom-helper';

// 创建元素
const div = XDom.create('div', { className: 'container' });

// 设置样式
XDom.setStyle(div, {
  backgroundColor: 'red',
  width: '100px',
  height: '100px'
});

// 添加到文档
XDom.appendTo(document.body, div);

// 添加事件监听器
XDom.on(div, 'click', () => {
  console.log('Div clicked!');
});

// 移除元素
setTimeout(() => {
  XDom.remove(div);
}, 3000);
```

## reorder

DOM 专用的元素重新排序函数，可以直接操作 DOM 元素的位置。

### 用法

```tsx
import { reorder } from 'wy-react-dom-helper';

// 获取父元素
const container = document.getElementById('items-container');
if (container) {
  // 将索引为 1 的子元素移动到索引为 3 的位置
  reorder(container, 1, 3);
}
```

## br 命名空间下的工具函数

DOM 包中包含了 `br` 命名空间，提供了更多专门的 DOM 操作工具。

### br/util

提供了一些通用的 DOM 工具函数。

```tsx
import { br } from 'wy-react-dom-helper';

// 检查是否支持某个特性
const supportsTouch = br.util.supports('touch');

// 获取元素的计算样式
const element = document.getElementById('my-element');
if (element) {
  const style = br.util.getStyle(element);
  console.log('元素宽度:', style.width);
}
```

### br/dom

提供了 DOM 元素操作的工具函数。

```tsx
import { br } from 'wy-react-dom-helper';

// 创建一个带有内容的元素
const paragraph = br.dom.create('p', '这是一个段落');

// 克隆元素
const clonedParagraph = br.dom.clone(paragraph);

// 获取元素的所有子元素
const children = br.dom.children(document.getElementById('container'));
```

### br/svg

提供了 SVG 相关的操作工具函数。

```tsx
import { br } from 'wy-react-dom-helper';

// 创建 SVG 元素
const svg = br.svg.create('svg', { width: '100', height: '100' });
const circle = br.svg.create('circle', {
  cx: '50',
  cy: '50',
  r: '40',
  fill: 'red'
});

// 将圆添加到 SVG
br.svg.append(svg, circle);
```

### br/attr

提供了属性操作的工具函数。

```tsx
import { br } from 'wy-react-dom-helper';

const element = document.getElementById('my-element');
if (element) {
  // 设置属性
  br.attr.set(element, {
    'data-id': '123',
    'aria-label': '这是一个示例元素'
  });
  
  // 获取属性
  const id = br.attr.get(element, 'data-id');
  
  // 移除属性
  br.attr.remove(element, 'aria-label');
}
```

### br/renderNode

提供了节点渲染相关的工具函数。

```tsx
import { br } from 'wy-react-dom-helper';

// 创建一个渲染函数
const renderText = (text: string) => {
  const textNode = document.createTextNode(text);
  return textNode;
};

// 渲染节点到容器
const container = document.getElementById('render-container');
if (container) {
  br.renderNode(container, renderText('Hello World'));
}
```