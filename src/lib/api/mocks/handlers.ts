import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from 'src/lib/api/config';

export const handlers = [
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };

    if (body.username === 'emilys' && body.password === 'emilyspass') {
      return HttpResponse.json({
        id: 1,
        username: 'emilys',
        email: 'emily.johnson@x.dummyjson.com',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 400 });
  }),

  http.post(`${API_BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'mock-refreshed-access-token',
      refreshToken: 'mock-refreshed-refresh-token',
    });
  }),

  http.get(`${API_BASE_URL}/products`, () => {
    return HttpResponse.json({
      products: [
        {
          id: 1,
          title: 'Mock Product',
          description: 'A product for testing',
          price: 9.99,
          brand: 'MockBrand',
          category: 'mock-category',
          thumbnail: 'https://example.com/thumb.jpg',
          images: ['https://example.com/img1.jpg'],
        },
      ],
      total: 1,
      skip: 0,
      limit: 10,
    });
  }),

  http.get(`${API_BASE_URL}/products/search`, () => {
    return HttpResponse.json({
      products: [],
      total: 0,
      skip: 0,
      limit: 10,
    });
  }),
];