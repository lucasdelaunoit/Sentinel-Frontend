import { useState, useEffect } from "react";

export function useTablePagination(defaultPerPage = 15, resetDeps: unknown[] = []) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...resetDeps, perPage]);

  return { page, setPage, perPage, setPerPage };
}
