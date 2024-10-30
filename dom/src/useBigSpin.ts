import { EmptyFun, ReadValueCenter } from "wy-helper";
import { useEffect } from "react";
import { useStoreTriggerRender } from "wy-react-helper";
import { subscribeRequestAnimationFrame } from "wy-dom-helper";

export function useBigSpin(
  drawValue: ReadValueCenter<boolean>,
  onDrawEffect: () => (time: number, cancel: EmptyFun) => void
) {
  const onDraw = useStoreTriggerRender(drawValue);
  useEffect(() => {
    if (onDraw) {
      const call = onDrawEffect();
      return subscribeRequestAnimationFrame((time, r) => {
        call(time, r.cancel);
      });
    }
  }, [onDraw]);
  return onDraw;
}