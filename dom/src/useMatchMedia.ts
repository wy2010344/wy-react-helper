import { useEffect } from "react";
import { useChange } from "wy-react-helper";

export function useMatchMedia(pattern: string) {
  const [matchMedia, setMatchMedia] = useChange(true);
  useEffect(() => {
    function heightChange(ev: MediaQueryListEvent) {
      setMatchMedia(ev.matches);
    }
    const match = window.matchMedia(pattern);
    setMatchMedia(match.matches);
    match.addEventListener("change", heightChange);
    return () => {
      match.removeEventListener("change", heightChange);
    };
  }, [pattern]);
  return matchMedia;
}