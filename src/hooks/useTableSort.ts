import { useState } from "react";

export function useTableSort<K extends string>(defaultKey: K, defaultDir: "asc" | "desc" = "asc") {
  const [sort, setSort] = useState<{ key: K; dir: "asc" | "desc" }>({ key: defaultKey, dir: defaultDir });

  function toggleSort(key: K) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  return { sort, toggleSort };
}
