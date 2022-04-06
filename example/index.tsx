import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { UseEffect, Hook, generateHook, createSharePortal, valueOf, observer, useStoreTriggerRender } from '../src'
import { PortalCall, shareCount, usePortals } from './drag/Panel';
import PanelReact from './drag/PanelReact';
import PanelMve from './drag/PanelMve';
import { OBTodoApp, TodoApp } from './mobxtodo';
const App = () => {
  const [count, setCount] = React.useState(1)
  console.log("render-app")

  return (
    <div>
      <PortalArea />
      <button onClick={() => setCount(count + 1)}>添加</button>
      {Array(count).fill("").map((v, i) => {
        return <PortalCall key={i}>{x => {
          if (Number(x) % 2 == 0) {
            return <PanelMve key={x} index={x}>
              <div>我是-mve实现的 {count}</div>
              <button onClick={() => setCount(count + 1)}>增加</button>
            </PanelMve>
          } else {
            return <PanelReact key={x} index={x}>
              <div>我是-react实现的 {count}</div>
              <button onClick={() => setCount(count + 1)}>增加</button>
              <button onClick={() => shareCount.set(shareCount.get() + 1)}>增加 share-count</button>
            </PanelReact>
          }
        }}
        </PortalCall>
      })}
      {/* <PortalCall>{x => {
        return <PanelReact key={x} index={x}>
          <TestPanel />
        </PanelReact>
      }}</PortalCall> */}
      <TestPanel2 />
      <TestPanel3 />
      <PortalCall>{x => {
        return <PanelReact key={x} index={x}>
          <OBTodoApp />
        </PanelReact>
      }}</PortalCall>
    </div>
  );
};

function PortalArea() {
  const portals = usePortals()
  return <>
    {portals}
  </>
}

const shareValue = valueOf(9)
const TestPanel = observer(() => {
  return <>
    <div>测试portal</div>
    <button onClick={() => {
      shareValue(shareValue() + 1)
      console.log(shareValue())
    }}>增加 {shareValue()}</button>
  </>
})

const TestPanel2 = observer(() => {
  const count = useStoreTriggerRender(shareCount)

  const [idx, setIdx] = React.useState(0)
  useEffect(() => {
    console.log("effect", idx)

    return () => {
      console.log("effect-destroy", idx)
    }
  }, [idx])
  React.useLayoutEffect(() => {
    console.log("layout-effect", idx)

    return () => {
      console.log("layout-effect-destroy", idx)
    };
  }, [idx])
  return <PortalCall>{x => <PanelReact key={x} index={x}>
    <div>测试portal</div>
    <button onClick={() => {
      shareValue(shareValue() + 1)
      console.log(shareValue())
    }}>增加 {shareValue()}</button>
    <div>share-count {count}</div>
    <button onClick={() => setIdx(idx + 1)}>增加idx {idx}</button>
  </PanelReact>}</PortalCall>
})


import { observer as observerMOBX } from 'mobx-react'
import { useEffect } from 'react';
const TestPanel3 = observerMOBX(() => {
  return <PortalCall>{x => {
    return <PanelReact key={x} index={x}>
      <TodoApp />
    </PanelReact>
  }}</PortalCall>
})


ReactDOM.render(<App />, document.getElementById('root'));
