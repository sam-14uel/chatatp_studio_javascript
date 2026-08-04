/**
 * Configuration and credential storage for the Studio CLI.
 *
 * Configuration lives at `~/.studio/config.json` by default (override with
 * the `STUDIO_CONFIG_DIR` / `STUDIO_CONFIG_PATH` environment variables). It
 * stores the API base URL and the token bundle returned by the
 * authentication endpoints (access/refresh JWTs and/or a DRF token).
 */
import fs from "fs";
import os from "os";
import path from "path";

export const DEFAULT_API_URL = "https://chatatp-agent-builder-backend.onrender.com";

const CONFIG_DIR = process.env.STUDIO_CONFIG_DIR || path.join(os.homedir(), ".studio");
const CONFIG_PATH = process.env.STUDIO_CONFIG_PATH || path.join(CONFIG_DIR, "config.json");

export interface ConfigData {
  api_url: string;
  access?: string;
  refresh?: string;
  token?: string;
  user_email?: string;
  user_id?: number;
  team_id?: number;
  output_format: "table" | "json";
}

const FIELDS: (keyof ConfigData)[] = [
  "api_url",
  "access",
  "refresh",
  "token",
  "user_email",
  "user_id",
  "team_id",
  "output_format",
];

export class Config implements ConfigData {
  api_url: string = process.env.STUDIO_API_URL || DEFAULT_API_URL;
  access?: string;
  refresh?: string;
  token?: string;
  user_email?: string;
  user_id?: number;
  team_id?: number;
  output_format: "table" | "json" = "table";

  static configPath(): string {
    return CONFIG_PATH;
  }

  static load(): Config {
    const cfg = new Config();
    if (fs.existsSync(CONFIG_PATH)) {
      try {
        const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
        for (const field of FIELDS) {
          if (raw[field] !== undefined) {
            (cfg as any)[field] = raw[field];
          }
        }
      } catch {
        // Corrupt config file: fall back to defaults rather than crashing.
      }
    }
    if (process.env.STUDIO_API_URL) cfg.api_url = process.env.STUDIO_API_URL;
    if (process.env.STUDIO_TOKEN) cfg.token = process.env.STUDIO_TOKEN;
    return cfg;
  }

  save(): void {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    const data: Record<string, unknown> = {};
    for (const field of FIELDS) data[field] = (this as any)[field];
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), { mode: 0o600 });
  }

  clearCredentials(): void {
    this.access = undefined;
    this.refresh = undefined;
    this.token = undefined;
    this.user_email = undefined;
    this.user_id = undefined;
  }

  isAuthenticated(): boolean {
    return Boolean(this.access || this.token);
  }

  set(key: string, value: unknown): void {
    if (!FIELDS.includes(key as keyof ConfigData)) {
      throw new Error(`Unknown config key: ${key}`);
    }
    (this as any)[key] = value;
  }

  get(key: string): unknown {
    if (!FIELDS.includes(key as keyof ConfigData)) {
      throw new Error(`Unknown config key: ${key}`);
    }
    return (this as any)[key];
  }

  asObject(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const field of FIELDS) data[field] = (this as any)[field];
    return data;
  }
}
