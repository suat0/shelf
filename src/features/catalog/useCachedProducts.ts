import {useEffect, useState} from 'react';
import {getCachedProducts} from 'src/lib/db/productsRepository';
import type {Product} from 'src/lib/api/types';

// Reads whatever is in SQLite once, on mount. Doesn't refetch, doesn't
// listen for changes — it's a one-shot "what did we have last time"
// snapshot to show while the network query is in flight.
export function useCachedProducts() : Product[] {
    const [products,setProducts] = useState<Product[]>([]);
    useEffect(() => {
        getCachedProducts().then(setProducts);
    }, []);
    return products;
}