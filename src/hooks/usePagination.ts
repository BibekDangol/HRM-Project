import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 10;

export function usePagination<T>(
  data: T[],
  externalPage?: number,
  onPageChange?: (page: number) => void,
) {
  const [internalPage, setInternalPage] = useState(1);
  const [isChangingPage, setIsChangingPage] = useState(false); // ✅ new

  const isControlled = externalPage !== undefined;
  const page = isControlled ? externalPage : internalPage;

  useEffect(() => {
    if (!isControlled) setInternalPage(1);
    onPageChange?.(1);
  }, [data]);

  const setPage = (newPage: number) => {
    if (!isControlled) setInternalPage(newPage);
    onPageChange?.(newPage);

    // ✅ Show loader briefly on page change
    setIsChangingPage(true);
    setTimeout(() => setIsChangingPage(false), 400);
  };

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
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
    isChangingPage, // ✅ new
  };
}
