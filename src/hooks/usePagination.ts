import { useMemo, useState } from "react";

const PAGE_SIZE = 3;

export function usePagination<T>(data: T[], externalPage?: number) {
  const [internalPage, setInternalPage] = useState(1);

  // 🧠 decide source of truth
  const page = externalPage ?? internalPage;
  const setPage = externalPage ? () => {} : setInternalPage;

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const shouldShowPagination = totalPages > 1;

  const pagedData = useMemo(() => {
    return data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [data, page]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (page <= 3) return [1, 2, 3, 4, 5];

    if (page >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, totalPages]);

  return {
    page,
    setPage,
    totalPages,
    shouldShowPagination,
    pagedData,
    pageNumbers,
  };
}
