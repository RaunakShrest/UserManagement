import { useEffect, useState } from "react";

interface UseDebounceProps<T> {
  searchValue: T;
  timeout?: number;
}

export const useDebounce = <T>({
  searchValue,
  timeout = 1000,
}: UseDebounceProps<T>): T => {
  const [debounceData, setDebounceData] = useState<T>(searchValue);

  useEffect(() => {
    const interval = setTimeout(() => {
      setDebounceData(searchValue);
    }, timeout);

    return () => {
      clearTimeout(interval);
    };
  }, [searchValue, timeout]);

  return debounceData;
};
