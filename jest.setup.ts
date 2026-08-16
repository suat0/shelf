jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
});

// Shared handles so individual tests can control what the db returns:
//   mockGetAllAsync.mockResolvedValueOnce([...rows])
// Reset between tests in the global afterEach below.
export const mockGetAllAsync = jest.fn<Promise<any[]>, any[]>(() => Promise.resolve([]));
export const mockRunAsync = jest.fn(() => Promise.resolve({ lastInsertRowId: 0, changes: 0 }));
export const mockExecAsync = jest.fn(() => Promise.resolve());

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: mockExecAsync,
      runAsync: mockRunAsync,
      getAllAsync: mockGetAllAsync,
      getFirstAsync: jest.fn(() => Promise.resolve(null)),
    }),
  ),
}));


import {server} from 'src/lib/api/mocks/server';

beforeAll(() => server.listen({onUnhandledRequest: 'error'}));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());