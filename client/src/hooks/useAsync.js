import { useCallback, useEffect, useState } from "react";

/**
 * Runs an async fetcher on mount (and whenever `deps` change),
 * tracking loading/error/data state so pages don't each reimplement
 * the same three `useState` calls.
 */
export const useAsync = (fetcher, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { data, setData, loading, error, refetch: run };
};
