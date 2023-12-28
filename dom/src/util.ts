import { useEffect, useMemo } from "react"
import { emptyArray, quote } from "wy-helper"

export function useGetUrl(file: File | Blob) {
  const url = useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(url);
    };
  }, emptyArray);
  return url;
}