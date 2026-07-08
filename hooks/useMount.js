import { useEffect, useState } from "react";

export function useMount(callback, deps = []) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (callback) callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return isMounted;
}
