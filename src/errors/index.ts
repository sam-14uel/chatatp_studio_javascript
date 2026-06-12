// ──────────────────────────────────────────────
// SDK error hierarchy
// ──────────────────────────────────────────────

export class ChatATPError extends Error {
  readonly statusCode: number | undefined;
  readonly requestId: string | undefined;
  readonly payload: unknown;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      requestId?: string;
      payload?: unknown;
    } = {}
  ) {
    super(message);
    this.name = "ChatATPError";
    this.statusCode = options.statusCode;
    this.requestId = options.requestId;
    this.payload = options.payload;
  }
}

export class AuthenticationError extends ChatATPError {
  constructor(message = "Invalid or revoked API key.", options?: ConstructorParameters<typeof ChatATPError>[1]) {
    super(message, { statusCode: 401, ...options });
    this.name = "AuthenticationError";
  }
}

export class PermissionError extends ChatATPError {
  constructor(message = "Missing scope or owner permission.", options?: ConstructorParameters<typeof ChatATPError>[1]) {
    super(message, { statusCode: 403, ...options });
    this.name = "PermissionError";
  }
}

export class ValidationError extends ChatATPError {
  constructor(message = "Invalid request.", options?: ConstructorParameters<typeof ChatATPError>[1]) {
    super(message, { statusCode: 400, ...options });
    this.name = "ValidationError";
  }
}

export class RateLimitError extends ChatATPError {
  constructor(message = "Rate limit exceeded.", options?: ConstructorParameters<typeof ChatATPError>[1]) {
    super(message, { statusCode: 429, ...options });
    this.name = "RateLimitError";
  }
}

export class NotFoundError extends ChatATPError {
  constructor(message = "Resource not found.", options?: ConstructorParameters<typeof ChatATPError>[1]) {
    super(message, { statusCode: 404, ...options });
    this.name = "NotFoundError";
  }
}

export class ServerError extends ChatATPError {
  constructor(message = "Internal server error.", options?: ConstructorParameters<typeof ChatATPError>[1]) {
    super(message, { statusCode: 500, ...options });
    this.name = "ServerError";
  }
}

export class NetworkError extends ChatATPError {
  constructor(message = "Network request failed.", options?: ConstructorParameters<typeof ChatATPError>[1]) {
    super(message, { ...options });
    this.name = "NetworkError";
  }
}

export class TimeoutError extends NetworkError {
  constructor(message = "Request timed out.", options?: ConstructorParameters<typeof ChatATPError>[1]) {
    super(message, options);
    this.name = "TimeoutError";
  }
}

// Maps HTTP status codes to typed error classes
export function buildApiError(
  status: number,
  body: { detail?: string; [key: string]: unknown },
  requestId?: string
): ChatATPError {
  const message = body.detail ?? `HTTP ${status}`;
  const opts = { statusCode: status, requestId, payload: body };
  switch (status) {
    case 400: return new ValidationError(message, opts);
    case 401: return new AuthenticationError(message, opts);
    case 403: return new PermissionError(message, opts);
    case 404: return new NotFoundError(message, opts);
    case 429: return new RateLimitError(message, opts);
    default:  return status >= 500 ? new ServerError(message, opts) : new ChatATPError(message, opts);
  }
}
