import { authenticatedFetch } from 'src/lib/api/authenticatedFetch';
import type { Product, ProductListResponse } from 'src/lib/api/types';

const PAGE_SIZE = 20;

export function fetchProducts(pageParam: number): Promise<ProductListResponse> {
  return authenticatedFetch<ProductListResponse>(
    `/products?limit=${PAGE_SIZE}&skip=${pageParam}`,
  );
}

export function fetchProduct(id: number): Promise<Product> {
  return authenticatedFetch<Product>(`/products/${id}`);
}

export { PAGE_SIZE };