/**
 * Thin HTTP client for the Studio backend.
 *
 * This is the single seam between the CLI and the network. When this
 * codebase is merged into the official `@chatatp/studio` SDK, replace the
 * body of the request methods with calls into the official SDK's own
 * transport and keep the same method signatures -- services and commands
 * do not need to change.
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";

import { Config } from "./config";
import { APIError, AuthenticationError } from "./errors";
import { AUTH_TOKEN_REFRESH } from "./endpoints";

const DEFAULT_TIMEOUT = 30000;

export class APIClient {
  config: Config;
  private http: AxiosInstance;

  constructor(config: Config, timeoutMs: number = DEFAULT_TIMEOUT) {
    this.config = config;
    this.http = axios.create({
      baseURL: config.api_url.replace(/\/+$/, "") + "/",
      timeout: timeoutMs,
      validateStatus: () => true, // we handle status codes ourselves
    });
  }

  private authHeader(): Record<string, string> {
    if (this.config.token) return { Authorization: `Token ${this.config.token}` };
    if (this.config.access) return { Authorization: `Bearer ${this.config.access}` };
    return {};
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    return { Accept: "application/json", ...this.authHeader(), ...(extra || {}) };
  }

  private static extractMessage(payload: any): string | null {
    if (payload && typeof payload === "object") {
      for (const key of ["detail", "message", "error"]) {
        if (key in payload) return String(payload[key]);
      }
      const parts: string[] = [];
      for (const [field, errors] of Object.entries<any>(payload)) {
        if (Array.isArray(errors)) {
          parts.push(`${field}: ${errors.join("; ")}`);
        } else {
          parts.push(`${field}: ${errors}`);
        }
      }
      if (parts.length) return parts.join("; ");
    }
    if (typeof payload === "string") return payload;
    return null;
  }

  private handleResponse(resp: AxiosResponse): any {
    if (resp.status === 204) return null;
    const payload = resp.data;
    if (resp.status === 401) {
      throw new AuthenticationError();
    }
    if (resp.status < 200 || resp.status >= 300) {
      const message = APIClient.extractMessage(payload) || `Request failed with status ${resp.status}`;
      throw new APIError(message, resp.status, payload, resp.config.url);
    }
    return payload;
  }

  private async refreshToken(): Promise<boolean> {
    if (!this.config.refresh) return false;
    try {
      const resp = await this.http.post(AUTH_TOKEN_REFRESH, { refresh: this.config.refresh });
      if (resp.status < 200 || resp.status >= 300) return false;
      const access = resp.data?.access;
      if (!access) return false;
      this.config.access = access;
      this.config.save();
      return true;
    } catch {
      return false;
    }
  }

  private async request(method: string, urlPath: string, options: AxiosRequestConfig = {}, retryOn401 = true): Promise<any> {
    const headers = this.headers(options.headers as Record<string, string> | undefined);
    const resp = await this.http.request({ method, url: urlPath, ...options, headers });
    if (resp.status === 401 && retryOn401 && this.config.refresh) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.request(method, urlPath, options, false);
      }
    }
    return this.handleResponse(resp);
  }

  async get(urlPath: string, params?: Record<string, unknown>): Promise<any> {
    return this.request("GET", urlPath, { params });
  }

  async post(urlPath: string, body?: Record<string, unknown>, options: AxiosRequestConfig = {}): Promise<any> {
    return this.request("POST", urlPath, {
      data: body,
      headers: { "Content-Type": "application/json", ...(options.headers as any) },
      ...options,
    });
  }

  async put(urlPath: string, body?: Record<string, unknown>): Promise<any> {
    return this.request("PUT", urlPath, { data: body, headers: { "Content-Type": "application/json" } });
  }

  async patch(urlPath: string, body?: Record<string, unknown>): Promise<any> {
    return this.request("PATCH", urlPath, { data: body, headers: { "Content-Type": "application/json" } });
  }

  async delete(urlPath: string): Promise<any> {
    return this.request("DELETE", urlPath);
  }

  async upload(urlPath: string, filePath: string, fieldName = "file", extra?: Record<string, string>): Promise<any> {
    const form = new FormData();
    form.append(fieldName, fs.createReadStream(filePath), path.basename(filePath));
    if (extra) {
      for (const [key, value] of Object.entries(extra)) form.append(key, value);
    }
    return this.request("POST", urlPath, { data: form, headers: form.getHeaders() });
  }

  /** Raw access for advanced/streaming use cases (see `assistant chat --stream`). */
  get raw(): AxiosInstance {
    return this.http;
  }
}
