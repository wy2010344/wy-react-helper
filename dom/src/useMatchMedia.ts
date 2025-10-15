import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useChange } from 'wy-react-helper';

export function useMatchMedia(pattern: string) {
  const match = useMemo(() => window.matchMedia(pattern), [pattern]);
  const [matchMedia, setMatchMedia] = useChange(match.matches);
  useEffect(() => {
    function heightChange(ev: MediaQueryListEvent) {
      setMatchMedia(ev.matches);
    }
    setMatchMedia(match.matches);
    match.addEventListener('change', heightChange);
    return () => {
      match.removeEventListener('change', heightChange);
    };
  }, [match]);
  return matchMedia;
}

/**
 * 服务器端没有matchMedia
 * @param pattern
 * @param def
 * @returns
 */
export function useMatchMediaServer(pattern: string, def = false) {
  const [matchMedia, setMatchMedia] = useChange(def);
  useLayoutEffect(() => {
    const match = window.matchMedia(pattern);
    function heightChange(ev: MediaQueryListEvent) {
      setMatchMedia(ev.matches);
    }
    setMatchMedia(match.matches);
    match.addEventListener('change', heightChange);
    return () => {
      match.removeEventListener('change', heightChange);
    };
  }, [pattern]);
  return matchMedia;
}
