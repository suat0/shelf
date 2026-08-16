import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from 'src/features/catalog/catalogApi';
import { analytics } from 'src/lib/telemetry';

const DEBOUNCE_MS = 300;

export function useSearch(rawQuery: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [rawQuery]);

  const trimmed = debouncedQuery.trim();
  const isDebouncing = rawQuery !== debouncedQuery;

  const query =useQuery({
    queryKey: ['products', 'search', trimmed],
    // TanStack Query passes its own AbortSignal here, tied to this query's
    // lifecycle. When trimmed changes (a new debounced value lands), Query
    // aborts the in-flight request for the old value automatically — we
    // don't manage an AbortController by hand.
    queryFn: ({ signal }) => searchProducts(trimmed, signal),
    enabled: trimmed.length > 0,
  });

  useEffect(() => {
    if (query.data) {
      analytics.logEvent('search_performed', { resultCount: query.data.products.length });
    }
  }, [query.data]);
  
  return {...query, isDebouncing};
}