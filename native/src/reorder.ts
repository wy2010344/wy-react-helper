import { arrayToMove, reorderCheckTarget } from "wy-helper";
import { SharedValue, cancelAnimation } from 'react-native-reanimated'

export function reAnimatedMoveItem<T>(
  positions: T[],
  getKey: (n: T) => any,
  getHeight: (n: T) => number,
  key: string,
  topValue: number,
  velocity: number,
  moveIt: (key: string, toKey: string) => void
) {
  'worklet';
  // console.log("change", positions.value, () => SONG_HEIGHT, song.id, e.translationY)
  const list = positions
  const idx = list.findIndex(v => getKey(v) == key)
  if (idx < 0) {
    return [undefined] as const
  }
  let beHeight = 0
  for (let i = 0; i < idx; i++) {
    beHeight += getHeight(positions[i])
  }
  const offset = topValue - beHeight
  // getSONEHGIEHG()
  const toMove = reorderCheckTarget(positions, getKey, getHeight, key, offset, velocity)
  if (toMove) {
    const toKey = getKey(toMove)
    const idx1 = list.findIndex(v => getKey(v) == toKey)
    if (idx1 < 0) {
      return [undefined, idx] as const
    }
    moveIt(key, toKey)
    return [arrayToMove(list, idx, idx1), idx1] as const
  }
  return [undefined, idx] as const
}



export function changeScrollValue(
  scrollY: SharedValue<number>,
  contentHeight: number,
  containerHeight: number,
  topValue: number,
  selfHeight: number
) {
  'worklet';
  const lowerBound = scrollY.value;
  const upperBound = lowerBound + containerHeight - selfHeight;

  if (topValue < lowerBound) {
    const diff = Math.min(lowerBound - topValue, lowerBound);
    //Scroll up
    scrollY.value -= diff;
    return -diff
    // tempY.value -= diff
    // topValue -= diff
  } else if (topValue > upperBound) {
    const scrollHeight = contentHeight - containerHeight - scrollY.value;
    //Scroll down
    const diff = Math.min(topValue - upperBound, scrollHeight);
    scrollY.value += diff;
    return diff
    // tempY.value += diff
    // topValue += diff
  } else {
    cancelAnimation(scrollY)
  }
  return 0
}