import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchProduct, fetchProducts, PAGE_SIZE } from 'src/features/catalog/catalogApi';

export function useProducts() {
  return useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam }) => fetchProducts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.limit;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProduct(id),
  });
}