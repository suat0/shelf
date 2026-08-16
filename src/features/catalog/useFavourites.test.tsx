import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useIsFavourite, useFavourites } from 'src/features/catalog/useFavourites';
import { mockGetAllAsync, mockGetFirstAsync, mockRunAsync } from '../../../jest.setup';
import type { Product } from 'src/lib/api/types';

const testProduct: Product = {
  id: 1,
  title: 'Test Product',
  description: 'desc',
  price: 9.99,
  brand: 'TestBrand',
  category: 'test',
  thumbnail: 'https://example.com/t.jpg',
  images: [],
};

beforeEach(() => {
  mockGetAllAsync.mockReset();
  mockRunAsync.mockReset();
  mockGetFirstAsync.mockReset();
  mockGetAllAsync.mockResolvedValue([]);
  mockRunAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 0 });
  mockGetFirstAsync.mockResolvedValue(null);
});

describe('favourites persistence', () => {
  it('a favourite added in one hook instance is visible in a freshly mounted one', async () => {
    // First "session": mount useIsFavourite and toggle it on.
    const { result: firstMount } = await renderHook(() => useIsFavourite(testProduct.id));

    await waitFor(() => expect(firstMount.current.favourited).toBe(false));

    // After toggling, getAllAsync (which useFavourites/isFavourite reads
    // through) should reflect the product as favourited on the next read —
    // simulate that by making the mock return it now that runAsync "wrote" it.
    mockGetAllAsync.mockResolvedValue([
      {
        product_id: testProduct.id,
        payload: JSON.stringify(testProduct),
        favourited_at: Date.now(),
      },
    ]);
    mockGetFirstAsync.mockResolvedValue({ 1: 1 }); // any non-null row means "is favourite"

    await act(async () => {
      await firstMount.current.toggle(testProduct);
    });

    await waitFor(() => expect(firstMount.current.favourited).toBe(true));
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO favourites'),
      expect.arrayContaining([testProduct.id]),
    );

    // "Restart": a completely new hook instance, as if the app relaunched
    // and FavouritesScreen mounted fresh. It reads through the same
    // (mocked) SQLite table, which still has the row.
    const { result: secondMount } = await renderHook(() => useFavourites());

    await waitFor(() => expect(secondMount.current.favourites).toHaveLength(1));
    expect(secondMount.current.favourites[0].id).toBe(testProduct.id);
  });
});