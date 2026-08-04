/**
 * Terminal UI helpers shared by every command module (colors, tables,
 * spinners, prompts).
 */
import chalk from "chalk";
import Table from "cli-table3";
import ora, { Ora } from "ora";
import inquirer from "inquirer";
import fs from "fs";

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printSuccess(message: string): void {
  console.log(chalk.green.bold("\u2713"), message);
}

export function printInfo(message: string): void {
  console.log(chalk.cyan.bold("i"), message);
}

export function printWarning(message: string): void {
  console.log(chalk.yellow.bold("!"), message);
}

export function printError(message: string): void {
  console.error(chalk.red.bold("\u2717"), message);
}

export function printPanel(title: string, body: string): void {
  console.log(chalk.bold.underline(title));
  console.log(body);
}

export function maskSecret(value?: string, keep = 4): string {
  if (!value) return "";
  if (value.length <= keep) return "*".repeat(value.length);
  return "*".repeat(value.length - keep) + value.slice(-keep);
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    const text = JSON.stringify(value);
    return text.length <= 60 ? text : text.slice(0, 57) + "...";
  }
  return String(value);
}

export function printTable(rows: Record<string, unknown>[], columns?: string[], title?: string): void {
  if (!rows.length) {
    printInfo("No results.");
    return;
  }
  const cols = columns && columns.length ? columns : Object.keys(rows[0]);
  if (title) console.log(chalk.bold(title));
  const table = new Table({ head: cols.map((c) => chalk.cyan.bold(c)) });
  for (const row of rows) {
    table.push(cols.map((c) => stringify(row[c])));
  }
  console.log(table.toString());
}

export function render(data: any, outputFormat: "table" | "json" = "table", columns?: string[], title?: string): void {
  if (outputFormat === "json") {
    printJson(data);
    return;
  }
  if (data && typeof data === "object" && Array.isArray(data.results)) {
    printTable(data.results, columns, title);
    const { results, ...meta } = data;
    if (Object.keys(meta).length) {
      printInfo(`count=${meta.count} next=${Boolean(meta.next)} previous=${Boolean(meta.previous)}`);
    }
    return;
  }
  if (Array.isArray(data)) {
    printTable(data, columns, title);
    return;
  }
  if (data && typeof data === "object") {
    printTable([data], columns, title);
    return;
  }
  console.log(data);
}

export function spinner(message: string): Ora {
  return ora(message).start();
}

export async function confirm(message: string, defaultValue = false): Promise<boolean> {
  const { value } = await inquirer.prompt([{ type: "confirm", name: "value", message, default: defaultValue }]);
  return value;
}

export async function prompt(message: string, defaultValue?: string, isPassword = false): Promise<string> {
  const { value } = await inquirer.prompt([
    { type: isPassword ? "password" : "input", name: "value", message, default: defaultValue },
  ]);
  return value;
}

export function parseJsonOption(value?: string): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  let text = value;
  if (text.startsWith("@")) {
    text = fs.readFileSync(text.slice(1), "utf-8");
  }
  try {
    return JSON.parse(text);
  } catch (err: any) {
    throw new Error(`Invalid JSON: ${err.message}`);
  }
}

export function keyValuePairsToDict(pairs: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) {
      throw new Error(`Expected key=value, got: ${pair}`);
    }
    const key = pair.slice(0, idx);
    const rawValue = pair.slice(idx + 1);
    try {
      result[key] = JSON.parse(rawValue);
    } catch {
      result[key] = rawValue;
    }
  }
  return result;
}
