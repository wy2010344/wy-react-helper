import { ReadValueCenter } from "wy-helper";
import { useEffect } from "react";
import { useStoreTriggerRender } from "wy-react-helper";
import { subscribeRequestAnimationFrame } from "wy-dom-helper";

export function useBigSpin(
  drawValue: ReadValueCenter<boolean>,
  onDrawEffect: () => (time: number) => any
) {
  const onDraw = useStoreTriggerRender(drawValue);
  useEffect(() => {
    if (onDraw) {
      return subscribeRequestAnimationFrame(onDrawEffect());
    }
  }, [onDraw]);
  return onDraw;
}