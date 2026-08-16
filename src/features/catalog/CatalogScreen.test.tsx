import { render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { http, HttpResponse } from 'msw';
import { CatalogScreen } from 'src/features/catalog/CatalogScreen';
import { API_BASE_URL } from 'src/lib/api/config';
import { server } from 'src/lib/api/mocks/server';
import { setAccessToken } from 'src/lib/api/tokenStore';
import { mockGetAllAsync } from '../../../jest.setup';

function makeCachedRow(id: number, title: string) {
  const product = {
    id,
    title,
    description: 'cached',
    price: 1,
    brand: 'CachedBrand',
    category: 'cached',
    thumbnail: 'https://example.com/t.jpg',
    images: [],
  };
  return {
    id,
    title,
    brand: 'CachedBrand',
    category: 'cached',
    price: 1,
    thumbnail: 'https://example.com/t.jpg',
    payload: JSON.stringify(product),
    cached_at: 1,
  };
}

function renderCatalog() {
  // A fresh QueryClient per test so cached query results can't leak across
  // tests. Retries off: the failure test would otherwise sit through
  // TanStack Query's retry schedule before isError flips.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <CatalogScreen />
      </NavigationContainer>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  setAccessToken('test-token');
  mockGetAllAsync.mockReset();
  mockGetAllAsync.mockResolvedValue([]);
});

describe('CatalogScreen read-through cache', () => {
  it('renders cached rows before the network resolves, then replaces them', async () => {
    mockGetAllAsync.mockResolvedValue([makeCachedRow(1, 'Cached Product')]);

    server.use(
      http.get(`${API_BASE_URL}/products`, async () => {
        // Delay so the cached row has a window to be on screen alone.
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({
          products: [
            {
              id: 2,
              title: 'Network Product',
              description: 'from network',
              price: 2,
              brand: 'NetBrand',
              category: 'net',
              thumbnail: 'https://example.com/n.jpg',
              images: [],
            },
          ],
          total: 1,
          skip: 0,
          limit: 20,
        });
      }),
    );

    await renderCatalog();

    // Cache first.
    await waitFor(() => expect(screen.getByText('Cached Product')).toBeTruthy());

    // Network data replaces it once it lands.
    await waitFor(() => expect(screen.getByText('Network Product')).toBeTruthy());
    expect(screen.queryByText('Cached Product')).toBeNull();
  });

  it('leaves cached rows on screen when the fetch fails', async () => {
    mockGetAllAsync.mockResolvedValue([makeCachedRow(1, 'Cached Product')]);

    server.use(
      http.get(`${API_BASE_URL}/products`, () => HttpResponse.error()),
    );

    await renderCatalog();

    await waitFor(() => expect(screen.getByText('Cached Product')).toBeTruthy());

    // The offline banner appears, and crucially the row is still there —
    // no empty state, no error screen replacing usable data.
    await waitFor(() =>
      expect(screen.getByText("You're offline. Showing saved products.")).toBeTruthy(),
    );
    expect(screen.getByText('Cached Product')).toBeTruthy();
  });
});