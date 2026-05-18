import { useSearchParams } from "react-router-dom";

export function useTabParam<T extends string>(defaultTab: T, allowed: readonly T[], key = "t") {
  const [params, setParams] = useSearchParams();
  const raw = params.get(key) as T | null;
  const active = raw && allowed.includes(raw) ? raw : defaultTab;

  const setActive = (next: string) => {
    const p = new URLSearchParams(params);
    next === defaultTab ? p.delete(key) : p.set(key, next);
    setParams(p, { replace: true });
  };

  return [active, setActive] as const;
}
