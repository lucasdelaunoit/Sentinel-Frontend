import { useState, useEffect } from "react";

export function useTablePagination(defaultPerPage = 15, resetDeps: unknown[] = []) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);

  useEffect(() => {
    setPage(1);
  }, [...resetDeps, perPage]);

  return { page, setPage, perPage, setPerPage };
}
