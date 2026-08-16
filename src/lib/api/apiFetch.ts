import {API_BASE_URL} from 'src/lib/api/config';
import {ApiError, NetworkError} from 'src/lib/api/errors';

type ApiFetchOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    signal?: AbortSignal;
};

// Generic so each call site gets a typed response, e.g.
// apiFetch<ProductListResponse>('/products')
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    let response: Response;
    try {
        response = await fetch(url, {
            method: options.method ?? 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: options.signal,
        });
    } catch (cause) {
        throw new NetworkError(`Request to ${path} failed`, cause);
    }
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status, body);
    }
    return response.json() as Promise<T>;
}
