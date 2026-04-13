import { isAxiosError } from "axios";
import { rwcCircuitCoolOffMs, rwcCircuitFailureThreshold } from "consts/reliability.consts";

export type UpstreamCircuitSnapshot = Record<
  string,
  {
    consecutiveFailures: number;
    coolOffUntilMs: number | null;
  }
>;

const failures = new Map<string, number>();
const coolUntil = new Map<string, number>();

function hostKey(urlOrHost: string): string {
  if (urlOrHost.includes("://")) {
    try {
      return new URL(urlOrHost).hostname.toLowerCase();
    } catch {
      return urlOrHost.toLowerCase();
    }
  }
  return urlOrHost.toLowerCase();
}

/** Returns false when host is in cool-off — caller should skip the upstream request. */
export function upstreamCircuitAllowRequest(url: string): boolean {
  const h = hostKey(url);
  const until = coolUntil.get(h);
  if (until != null && Date.now() < until) return false;
  if (until != null && Date.now() >= until) {
    coolUntil.delete(h);
    failures.set(h, 0);
  }
  return true;
}

export function upstreamCircuitRecordSuccess(url: string): void {
  const h = hostKey(url);
  failures.set(h, 0);
  coolUntil.delete(h);
}

export function upstreamCircuitRecordFailure(url: string): void {
  const h = hostKey(url);
  const k = rwcCircuitFailureThreshold();
  const n = (failures.get(h) ?? 0) + 1;
  failures.set(h, n);
  if (n >= k) {
    coolUntil.set(h, Date.now() + rwcCircuitCoolOffMs());
    failures.set(h, 0);
  }
}

/** Count toward circuit only for overload / server / network (not 404 / generic 4xx). */
export function upstreamCircuitRecordFailureFromError(url: string, err: unknown): void {
  if (isAxiosError(err)) {
    if (err.code === "ERR_CANCELED") return;
    const s = err.response?.status;
    if (s === 404) return;
    if (s != null && s >= 400 && s < 500 && s !== 408 && s !== 429) return;
  }
  upstreamCircuitRecordFailure(url);
}

export function getUpstreamCircuitSnapshot(): UpstreamCircuitSnapshot {
  const out: UpstreamCircuitSnapshot = {};
  const hosts = new Set([...failures.keys(), ...coolUntil.keys()]);
  for (const h of hosts) {
    out[h] = {
      consecutiveFailures: failures.get(h) ?? 0,
      coolOffUntilMs: coolUntil.get(h) ?? null,
    };
  }
  return out;
}

/** Test isolation */
export function resetUpstreamCircuitsForTests(): void {
  failures.clear();
  coolUntil.clear();
}
