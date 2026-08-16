import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchProduct, fetchProducts} from 'src/features/catalog/catalogApi';
import { cacheProducts } from 'src/lib/db/productsRepository';

export function useProducts() {
  return useInfiniteQuery({
    queryKey: ['products'],
    queryFn: async ({ pageParam }) => {
      const result = await fetchProducts(pageParam);
      await cacheProducts(result.products);
      return result;
    },
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