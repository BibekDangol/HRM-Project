import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 10;

export type UsePaginationOptions = {
  pageSize?: number;
  resetKey?: any;
};

export function usePagination<T>(
  data: T[],
  externalPage?: number,
  onPageChange?: (page: number) => void,
  options?: UsePaginationOptions,
) {
  const pageSize = options?.pageSize ?? PAGE_SIZE;
  const resetKey = options?.resetKey;

  const [internalPage, setInternalPage] = useState(1);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Adjust state during render when resetKey changes (React 19 pattern)
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setInternalPage(1);
  }

  const isControlled = externalPage !== undefined;
  const rawPage = isControlled ? externalPage : internalPage;

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  // Keep page clamped within bounds
  const page = Math.min(Math.max(1, rawPage), totalPages);

  // Clear transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const prevReportedPageRef = useRef(page);
  useEffect(() => {
    if (prevReportedPageRef.current !== page) {
      prevReportedPageRef.current = page;
      onPageChange?.(page);
    }
  }, [page, onPageChange]);

  const setPage = (newPage: number) => {
    const clamped = Math.min(Math.max(1, newPage), totalPages);
    if (!isControlled) setInternalPage(clamped);

    // Show loader briefly on page change, safely clearing any active timer
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    setIsChangingPage(true);
    transitionTimerRef.current = setTimeout(() => {
      setIsChangingPage(false);
      transitionTimerRef.current = null;
    }, 400);
  };

  const shouldShowPagination = totalPages > 1;

  const pagedData = useMemo(() => {
    return data.slice((page - 1) * pageSize, page * pageSize);
  }, [data, page, pageSize]);

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
    isChangingPage,
  };
}

export default usePagination;
