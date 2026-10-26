import { useCallback, useEffect, useRef, useState } from "react";

export type UseRefreshableQueryOptions<T> = {
  initialData?: T;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
};

export function useRefreshableQuery<T>(
  queryFn: () => Promise<T>,
  deps: readonly any[] = [],
  options: UseRefreshableQueryOptions<T> = {},
) {
  const { initialData, enabled = true, onSuccess, onError } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(enabled && initialData === undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<any>(null);

  const queryFnRef = useRef(queryFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    queryFnRef.current = queryFn;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFnRef.current();
      setData(result);
      onSuccessRef.current?.(result);
      return result;
    } catch (err) {
      setError(err);
      onErrorRef.current?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const result = await queryFnRef.current();
      setData(result);
      onSuccessRef.current?.(result);
      return result;
    } catch (err) {
      setError(err);
      onErrorRef.current?.(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    queryFnRef.current()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
        onSuccessRef.current?.(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
        onErrorRef.current?.(err);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return {
    data,
    setData,
    loading,
    refreshing,
    error,
    refetch,
    onRefresh,
  };
}

export default useRefreshableQuery;
