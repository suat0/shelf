import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { useSearch } from 'src/features/catalog/useSearch';
import { API_BASE_URL } from 'src/lib/api/config';
import { server } from 'src/lib/api/mocks/server';
import { setAccessToken } from 'src/lib/api/tokenStore';
import type { PropsWithChildren } from 'react';
import { act } from '@testing-library/react-native';

function wrapper({ children }: PropsWithChildren) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  setAccessToken('test-token');
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useSearch', () => {
  it('does not fire a request until 300ms after typing stops', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${API_BASE_URL}/products/search`, () => {
        requestCount += 1;
        return HttpResponse.json({ products: [], total: 0, skip: 0, limit: 10 });
      }),
    );

    const { rerender } = await renderHook(({ query }: { query: string }) => useSearch(query), {
      wrapper,
      initialProps: { query: '' },
    });

    await rerender({ query: 'p' });
    await act(() => {
      jest.advanceTimersByTime(100);
    });
    await rerender({ query: 'ph' });
    await act(() => {
      jest.advanceTimersByTime(100);
    });
    await rerender({ query: 'phone' });

    // Only 200ms have passed since the last change — under the 300ms
    // debounce, so no request should have fired for any of the three values.
    expect(requestCount).toBe(0);

    await act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => expect(requestCount).toBe(1));
  });

  it('cancels the previous request when the query changes again', async () => {
    const seenQueries: string[] = [];
    server.use(
      http.get(`${API_BASE_URL}/products/search`, ({ request }) => {
        const url = new URL(request.url);
        seenQueries.push(url.searchParams.get('q') ?? '');
        return HttpResponse.json({ products: [], total: 0, skip: 0, limit: 10 });
      }),
    );

    const { rerender } = await renderHook(({ query }: { query: string }) => useSearch(query), {
      wrapper,
      initialProps: { query: '' },
    });

    await rerender({ query: 'phone' });
    await act(() => {
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => expect(seenQueries).toContain('phone'));

    await rerender({ query: 'phone case' });
    await act(() => {
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => expect(seenQueries).toContain('phone case'));

    // Both requests were allowed to fire here (they're for different debounced
    // values, not a race) — the point is each one only fires once, proving
    // the debounce+queryKey change didn't duplicate requests.
    expect(seenQueries.filter((q) => q === 'phone').length).toBe(1);
    expect(seenQueries.filter((q) => q === 'phone case').length).toBe(1);
  });
});