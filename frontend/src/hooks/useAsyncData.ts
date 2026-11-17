import { useState, useEffect, useCallback, useRef } from "react";

export interface UseAsyncDataOptions<T> {
  /** Начальные данные до завершения загрузки */
  initialData?: T;
  /** Зависимости, при изменении которых перезапускается загрузка */
  deps?: React.DependencyList;
  /** Запускать ли загрузку автоматически (по умолчанию true) */
  enabled?: boolean;
  /** Коллбек при успешной загрузке */
  onSuccess?: (data: T) => void;
  /** Коллбек при возникновении ошибки */
  onError?: (error: Error) => void;
}

export interface UseAsyncDataResult<T> {
  /** Загруженные данные */
  data: T;
  /** Флаг состояния загрузки */
  isLoading: boolean;
  /** Ошибка запроса (если произошла) */
  error: Error | null;
  /** Функция ручного перезапуска запроса */
  refetch: () => Promise<T | null>;
  /** Функция локального обновления данных */
  setData: React.Dispatch<React.SetStateAction<T>>;
}

/**
 * Универсальный хук для асинхронной загрузки данных (API, база данных, промисы)
 * с поддержкой отмены гонок запросов, индикации загрузки и автоперезапуска.
 *
 * @example
 * const { data: dolls, isLoading, error, refetch } = useAsyncData(fetchDolls, {
 *   initialData: [],
 * });
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataResult<T> {
  const {
    initialData,
    deps = [],
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T>(initialData as T);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);

  // Храним актуальный fetcher и коллбеки в ref, чтобы не вызывать лишних ререндеров
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Идентификатор запроса для предотвращения race condition
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  const execute = useCallback(async (): Promise<T | null> => {
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current();

      // Если компонент размонтирован или уже отправлен более свежий запрос — игнорируем ответ
      if (!isMountedRef.current || currentRequestId !== requestIdRef.current) {
        return null;
      }

      setData(result);
      setIsLoading(false);
      onSuccessRef.current?.(result);
      return result;
    } catch (err) {
      if (!isMountedRef.current || currentRequestId !== requestIdRef.current) {
        return null;
      }

      const normalizedError = err instanceof Error ? err : new Error(String(err));
      setError(normalizedError);
      setIsLoading(false);
      onErrorRef.current?.(normalizedError);
      return null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      execute();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return {
    data,
    isLoading,
    error,
    refetch: execute,
    setData,
  };
}

export default useAsyncData;
