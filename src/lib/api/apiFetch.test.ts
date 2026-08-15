import { http, HttpResponse } from 'msw';
import { apiFetch } from 'src/lib/api/apiFetch';
import { API_BASE_URL } from 'src/lib/api/config';
import { ApiError } from 'src/lib/api/errors';
import { server } from 'src/lib/api/mocks/server';
import type { ProductListResponse } from 'src/lib/api/types';

describe('apiFetch', () => {
  it('returns parsed JSON on a 200', async () => {
    const result = await apiFetch<ProductListResponse>('/products');

    expect(result.products).toHaveLength(1);
    expect(result.products[0].title).toBe('Mock Product');
  });

  it('throws ApiError with the status code on a 500', async () => {
    server.use(
      http.get(`${API_BASE_URL}/products`, () => {
        return HttpResponse.json({ message: 'Server exploded' }, { status: 500 });
      }),
    );

    await expect(apiFetch('/products')).rejects.toThrow(ApiError);

    try {
      await apiFetch('/products');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(500);
      expect((error as ApiError).body).toEqual({ message: 'Server exploded' });
    }
  });
});