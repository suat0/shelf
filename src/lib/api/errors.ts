// Represents an error response from the API — a request that reached the
// server but got back a non-2xx status (401, 404, 500, etc).
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Represents a request that never reached the server: no network,
// DNS failure, timeout, CORS, etc. Distinct from ApiError because the
// caller needs to react differently — an ApiError with status 401 means
// "refresh the token", a NetworkError means "show the offline banner".
export class NetworkError extends Error {
  constructor(message: string, public readonly cause: unknown) {
    super(message);
    this.name = 'NetworkError';
  }
}