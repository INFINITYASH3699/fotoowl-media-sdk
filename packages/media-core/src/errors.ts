/**
 * ============================================================
 * media-core — Custom Error Classes
 * ============================================================
 */

export class SDKError extends Error {
  public readonly code: string;
  public readonly endpoint: string | undefined;

  constructor(message: string, code: string, endpoint?: string) {
    super(message);
    this.name = "SDKError";
    this.code = code;
    this.endpoint = endpoint;
    Object.setPrototypeOf(this, SDKError.prototype);
  }
}

export class AuthError extends SDKError {
  constructor(message = "Invalid or missing API key", endpoint?: string) {
    super(message, "AUTH_ERROR", endpoint);
    this.name = "AuthError";
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class RateLimitError extends SDKError {
  public readonly retryAfter: number | undefined;

  constructor(
    message = "Rate limit exceeded",
    retryAfter?: number,
    endpoint?: string
  ) {
    super(message, "RATE_LIMIT", endpoint);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class NetworkError extends SDKError {
  constructor(message = "Network request failed", endpoint?: string) {
    super(message, "NETWORK_ERROR", endpoint);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class NotFoundError extends SDKError {
  constructor(message = "Resource not found", endpoint?: string) {
    super(message, "NOT_FOUND", endpoint);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ValidationError extends SDKError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
