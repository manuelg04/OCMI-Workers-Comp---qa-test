import { useCallback, useState } from 'react';
import { ZodIssue } from 'zod';

export type ErrorType = { message: string } | { errors: ZodIssue[] } | null;

type UseFetchOptions<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: ErrorType) => void;
  defaultData?: T;
};

type UseFetchResult<T> = {
  data: T | null;
  error: ErrorType;
  isLoading: boolean;
  fetch: (url: string, options?: RequestInit) => Promise<void>;
};

export const useFetch = <T>(
  options: UseFetchOptions<T> = {},
): UseFetchResult<T> => {
  const [data, setData] = useState<T | null>(options.defaultData ?? null);
  const [error, setError] = useState<ErrorType>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(
    async (url: string, fetchOptions?: RequestInit) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
          ...fetchOptions,
        });

        if (!response.ok) {
          setError(
            response.status === 422
              ? await response.json()
              : new Error(
                  (response.headers.get('content-type') ?? '').includes(
                    'application/json',
                  )
                    ? (await response.json()).message
                    : response.statusText,
                ),
          );
          options.onError?.(error);
          return;
        }

        const result = await response.json();
        setData(result);
        options.onSuccess?.(result);

        return result;
      } catch (e) {
        const error =
          e instanceof Error ? e : new Error('An unknown error occurred');
        setError(error);
        options.onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [options],
  );

  return {
    data,
    error,
    isLoading,
    fetch: fetchData,
  };
};
