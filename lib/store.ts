import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { PlushieResult } from "@/types";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "results.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

async function readStore(): Promise<PlushieResult[]> {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");
  return JSON.parse(raw) as PlushieResult[];
}

async function writeStore(results: PlushieResult[]) {
  await ensureStore();
  await fs.writeFile(dataFile, JSON.stringify(results, null, 2), "utf8");
}

export async function createResult(input: Omit<PlushieResult, "id" | "createdAt" | "isPaid">) {
  const results = await readStore();
  const newResult: PlushieResult = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    isPaid: false
  };

  results.unshift(newResult);
  await writeStore(results);
  return newResult;
}

export async function getResult(id: string) {
  const results = await readStore();
  return results.find((item) => item.id === id) ?? null;
}

export async function markPaidByResultId(id: string) {
  const results = await readStore();
  const index = results.findIndex((item) => item.id === id);

  if (index === -1) return null;

  results[index] = {
    ...results[index],
    isPaid: true
  };

  await writeStore(results);
  return results[index];
}

export async function attachCheckoutSession(resultId: string, checkoutSessionId: string) {
  const results = await readStore();
  const index = results.findIndex((item) => item.id === resultId);

  if (index === -1) return null;

  results[index] = {
    ...results[index],
    checkoutSessionId
  };

  await writeStore(results);
  return results[index];
}

export async function markPaidByCheckoutSessionId(checkoutSessionId: string) {
  const results = await readStore();
  const index = results.findIndex((item) => item.checkoutSessionId === checkoutSessionId);

  if (index === -1) return null;

  results[index] = {
    ...results[index],
    isPaid: true
  };

  await writeStore(results);
  return results[index];
}
