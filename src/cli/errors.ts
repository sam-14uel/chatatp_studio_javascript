/**
 * Error types raised by the Studio CLI's internal API client.
 */

export class StudioError extends Error {}

export class AuthenticationError extends StudioError {
  constructor(message = "Not authenticated or session expired. Run `studio auth login`.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ConfigError extends StudioError {}

export class APIError extends StudioError {
  statusCode?: number;
  payload?: unknown;
  url?: string;

  constructor(message: string, statusCode?: number, payload?: unknown, url?: string) {
    super(statusCode ? `[${statusCode}] ${message}` : message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.payload = payload;
    this.url = url;
  }
}
