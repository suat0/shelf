import { useCallback, useEffect, useState } from 'react';
import { addFavourite, removeFavourite, getFavourites, isFavourite } from 'src/lib/db/favouritesRepository';
import type { Product } from 'src/lib/api/types';
import { analytics } from 'src/lib/telemetry';

export function useFavourites() {
  const [favourites, setFavourites] = useState<Product[]>([]);

  const refresh = useCallback(() => {
    getFavourites().then(setFavourites);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { favourites, refresh };
}

export function useIsFavourite(productId: number) {
  const [favourited, setFavourited] = useState(false);

  const refresh = useCallback(() => {
    isFavourite(productId).then(setFavourited);
  }, [productId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function toggle(product: Product) {
    if (favourited) {
      await removeFavourite(product.id);
    } else {
      await addFavourite(product);
    }
    analytics.logEvent('favourite_toggled', { productId: product.id, favourited: !favourited });
    refresh();
  }

  return { favourited, toggle };
}