import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw === null ? defaultValue : (JSON.parse(raw) as T);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
