import { http, HttpResponse } from 'msw';
import { authenticatedFetch } from 'src/lib/api/authenticatedFetch';
import { API_BASE_URL } from 'src/lib/api/config';
import { server } from 'src/lib/api/mocks/server';
import {
  setAccessToken,
  setRefreshPromise,
  setSessionExpiredHandler,
} from 'src/lib/api/tokenStore';
import { setStoredRefreshToken, getStoredRefreshToken, clearStoredRefreshToken } from 'src/lib/auth/secureStorage';

beforeEach(async () => {
  // Module-scope state in tokenStore doesn't reset between tests on its own —
  // the module stays loaded across the whole file. Reset it by hand so one
  // test's token or in-flight promise can't leak into the next.
  setAccessToken('old-access-token');
  setRefreshPromise(null);
  setSessionExpiredHandler(null);
  await setStoredRefreshToken('old-refresh-token');
});

afterEach(async () => {
  await clearStoredRefreshToken();
});

describe('authenticatedFetch', () => {
  it('refreshes once on 401 and replays the original request', async () => {
    let productCallCount = 0;
    let refreshCallCount = 0;

    server.use(
      http.get(`${API_BASE_URL}/products/1`, ({ request }) => {
        productCallCount += 1;
        const auth = request.headers.get('Authorization');

        if (auth === 'Bearer new-access-token') {
          return HttpResponse.json({ id: 1, title: 'Refreshed Product' });
        }
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }),
      http.post(`${API_BASE_URL}/auth/refresh`, ({ request }) => {
        refreshCallCount += 1;
        const auth = request.headers.get('Authorization');
        if (auth !== 'Bearer old-refresh-token') {
          return HttpResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
        }
        return HttpResponse.json({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        });
      }),
    );

    const result = await authenticatedFetch<{ id: number; title: string }>('/products/1');

    expect(result.title).toBe('Refreshed Product');
    expect(productCallCount).toBe(2); // first 401, then the replay
    expect(refreshCallCount).toBe(1);
  });

  it('clears the session and notifies when refresh itself fails', async () => {
    const sessionExpiredHandler = jest.fn();
    setSessionExpiredHandler(sessionExpiredHandler);

    server.use(
      http.get(`${API_BASE_URL}/products/1`, () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }),
      http.post(`${API_BASE_URL}/auth/refresh`, () => {
        return HttpResponse.json({ message: 'Refresh token expired' }, { status: 401 });
      }),
    );

    await expect(authenticatedFetch('/products/1')).rejects.toThrow();
    expect(sessionExpiredHandler).toHaveBeenCalledTimes(1);
  });

  it('shares one refresh across two concurrent 401s', async () => {
    let refreshCallCount = 0;

    server.use(
      http.get(`${API_BASE_URL}/products/1`, ({ request }) => {
        const auth = request.headers.get('Authorization');
        return auth === 'Bearer new-access-token'
          ? HttpResponse.json({ id: 1 })
          : HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }),
      http.get(`${API_BASE_URL}/products/2`, ({ request }) => {
        const auth = request.headers.get('Authorization');
        return auth === 'Bearer new-access-token'
          ? HttpResponse.json({ id: 2 })
          : HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }),
      http.post(`${API_BASE_URL}/auth/refresh`, () => {
        refreshCallCount += 1;
        return HttpResponse.json({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        });
      }),
    );

    const [first, second] = await Promise.all([
      authenticatedFetch<{ id: number }>('/products/1'),
      authenticatedFetch<{ id: number }>('/products/2'),
    ]);

    expect(first.id).toBe(1);
    expect(second.id).toBe(2);
    expect(refreshCallCount).toBe(1); // the actual point of this test
  });

  it('does not attempt a refresh on a non-401 error', async () => {
    server.use(
      http.get(`${API_BASE_URL}/products/1`, () => {
        return HttpResponse.json({ message: 'Not found' }, { status: 404 });
      }),
    );

    await expect(authenticatedFetch('/products/1')).rejects.toMatchObject({ status: 404 });
  });
});