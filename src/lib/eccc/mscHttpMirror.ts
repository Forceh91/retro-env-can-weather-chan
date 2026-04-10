/**
 * MSC Datamart HTTP mirrors: high-throughput HPFX (primary) vs redundant Datamart (fallback).
 * See https://hpfx.collab.science.gc.ca/ — long-term, consider Sarracenia/AMQP delivery:
 * https://metpx.github.io/sarracenia/How2Guides/subscriber.html
 */
import { AxiosInstance, AxiosResponse, isAxiosError } from "axios";
import type { RwcAxiosRequestConfig } from "types/rwcAxiosConfig";
import {
  rwcHttpRetryBackoffMaxMs,
  rwcHttpRetryBackoffMinMs,
  rwcHttpRetryCount,
} from "consts/reliability.consts";
import {
  upstreamCircuitAllowRequest,
  upstreamCircuitRecordFailureFromError,
  upstreamCircuitRecordSuccess,
} from "lib/reliability/upstreamCircuit";

export const MSC_HPFX_ORIGIN = "https://hpfx.collab.science.gc.ca";
export const MSC_DATAMART_ORIGIN = "https://dd.weather.gc.ca";

/** Normalize legacy http://dd.weather.gc.ca links to https for consistent mirror swaps. */
export function normalizeMscHttpUrl(url: string): string {
  return url.replace(/^http:\/\/dd\.weather\.gc\.ca\b/i, `${MSC_DATAMART_ORIGIN}`);
}

/**
 * For dd.weather.gc.ca or hpfx.collab.science.gc.ca URLs, return [try first, try second]:
 * always prefer HPFX first, then Datamart. Other hosts are returned unchanged (single attempt).
 */
export function mscMirrorTryOrder(url: string): string[] {
  const normalized = normalizeMscHttpUrl(url);
  let u: URL;
  try {
    u = new URL(normalized);
  } catch {
    return [url];
  }

  if (u.hostname === "hpfx.collab.science.gc.ca") {
    const datamart = `${MSC_DATAMART_ORIGIN}${u.pathname}${u.search}${u.hash}`;
    const pair = normalized === datamart ? [normalized] : [normalized, datamart];
    return process.env.RWC_MSC_TRY_DATAMART_FIRST === "1" ? [...pair].reverse() : pair;
  }
  if (u.hostname === "dd.weather.gc.ca") {
    const hpfx = `${MSC_HPFX_ORIGIN}${u.pathname}${u.search}${u.hash}`;
    const pair = hpfx === normalized ? [normalized] : [hpfx, normalized];
    return process.env.RWC_MSC_TRY_DATAMART_FIRST === "1" ? [...pair].reverse() : pair;
  }
  return [normalized];
}

/** After an error on one mirror host, try the paired HPFX/Datamart URL (same wave). */
export function shouldTryNextMscMirrorHost(err: unknown): boolean {
  if (!isAxiosError(err)) return true;
  if (err.code === "ERR_CANCELED") return false;
  const status = err.response?.status;
  if (status == null) return true;
  if (status === 404 || status === 403) return true;
  if (status >= 500) return true;
  if (status === 408 || status === 429) return true;
  return false;
}

/** Start another retry wave (sleep + full candidate list) — not for terminal 4xx such as 404 after both mirrors. */
export function shouldStartAnotherMscMirrorWave(err: unknown): boolean {
  if (!isAxiosError(err)) return true;
  if (err.code === "ERR_CANCELED") return false;
  const status = err.response?.status;
  if (status == null) return true;
  if (status >= 500) return true;
  if (status === 408 || status === 429) return true;
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function jitterBackoffMs(attemptIndex: number): number {
  const minMs = rwcHttpRetryBackoffMinMs();
  const maxMs = rwcHttpRetryBackoffMaxMs();
  const cap = Math.min(maxMs, minMs * 2 ** attemptIndex);
  return minMs + Math.random() * Math.max(0, cap - minMs);
}

function defaultMscUpstreamMeta(url: string): { feed: string; key: string } {
  try {
    return { feed: "msc-http", key: new URL(url).pathname.slice(0, 120) };
  } catch {
    return { feed: "msc-http", key: url.slice(0, 120) };
  }
}

/** GET with HPFX-first / Datamart-failover for MSC mirror host pairs, bounded retries, circuit breaker. */
export async function axiosGetWithMscMirror<T = unknown>(
  client: AxiosInstance,
  url: string,
  config?: RwcAxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const maxExtraAttempts = rwcHttpRetryCount();
  const candidates = [...new Set(mscMirrorTryOrder(url))];
  let lastError: unknown;

  for (let wave = 0; wave <= maxExtraAttempts; wave++) {
    if (wave > 0) {
      await sleep(jitterBackoffMs(wave - 1));
    }
    for (let i = 0; i < candidates.length; i++) {
      const u = candidates[i];
      if (!upstreamCircuitAllowRequest(u)) {
        lastError = new Error(`MSC upstream in cool-off: ${u}`);
        continue;
      }
      try {
        const merged: RwcAxiosRequestConfig = {
          ...config,
          rwcUpstream: config?.rwcUpstream ?? defaultMscUpstreamMeta(u),
        };
        const response = await client.get<T>(u, merged);
        upstreamCircuitRecordSuccess(u);
        return response;
      } catch (err) {
        lastError = err;
        upstreamCircuitRecordFailureFromError(u, err);
        if (i === candidates.length - 1) break;
        if (!shouldTryNextMscMirrorHost(err)) break;
      }
    }
    if (lastError != null && !shouldStartAnotherMscMirrorWave(lastError)) break;
  }
  throw lastError;
}

export async function axiosGetWithMscMirrorResolved<T = unknown>(
  client: AxiosInstance,
  url: string,
  config?: RwcAxiosRequestConfig
): Promise<{ response: AxiosResponse<T>; resolvedUrl: string }> {
  const maxExtraAttempts = rwcHttpRetryCount();
  const candidates = [...new Set(mscMirrorTryOrder(url))];
  let lastError: unknown;

  for (let wave = 0; wave <= maxExtraAttempts; wave++) {
    if (wave > 0) {
      await sleep(jitterBackoffMs(wave - 1));
    }
    for (let i = 0; i < candidates.length; i++) {
      const u = candidates[i];
      if (!upstreamCircuitAllowRequest(u)) {
        lastError = new Error(`MSC upstream in cool-off: ${u}`);
        continue;
      }
      try {
        const merged: RwcAxiosRequestConfig = {
          ...config,
          rwcUpstream: config?.rwcUpstream ?? defaultMscUpstreamMeta(u),
        };
        const response = await client.get<T>(u, merged);
        upstreamCircuitRecordSuccess(u);
        return { response, resolvedUrl: u };
      } catch (err) {
        lastError = err;
        upstreamCircuitRecordFailureFromError(u, err);
        if (i === candidates.length - 1) break;
        if (!shouldTryNextMscMirrorHost(err)) break;
      }
    }
    if (lastError != null && !shouldStartAnotherMscMirrorWave(lastError)) break;
  }
  throw lastError;
}

export async function axiosHeadWithMscMirror(
  client: AxiosInstance,
  url: string,
  config?: RwcAxiosRequestConfig
): Promise<AxiosResponse<unknown>> {
  const maxExtraAttempts = rwcHttpRetryCount();
  const candidates = [...new Set(mscMirrorTryOrder(url))];
  let lastError: unknown;

  for (let wave = 0; wave <= maxExtraAttempts; wave++) {
    if (wave > 0) {
      await sleep(jitterBackoffMs(wave - 1));
    }
    for (let i = 0; i < candidates.length; i++) {
      const u = candidates[i];
      if (!upstreamCircuitAllowRequest(u)) {
        lastError = new Error(`MSC upstream in cool-off: ${u}`);
        continue;
      }
      try {
        const headConfig: RwcAxiosRequestConfig = {
          ...config,
          method: "HEAD",
          url: u,
          rwcUpstream: config?.rwcUpstream ?? { feed: "msc-head", key: new URL(u).pathname.slice(0, 120) },
        };
        const response = await client.request<unknown>(headConfig);
        upstreamCircuitRecordSuccess(u);
        return response;
      } catch (err) {
        lastError = err;
        upstreamCircuitRecordFailureFromError(u, err);
        if (i === candidates.length - 1) break;
        if (!shouldTryNextMscMirrorHost(err)) break;
      }
    }
    if (lastError != null && !shouldStartAnotherMscMirrorWave(lastError)) break;
  }
  throw lastError;
}
