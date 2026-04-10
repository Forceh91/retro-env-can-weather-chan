import { parseISO } from "date-fns";

/** If no successful citypage parse in this window, run a datamart-backed HTTP fetch (AMQP may be quiet). */
export const DEFAULT_CITYPAGE_STALE_FALLBACK_AFTER_MS = 2 * 60 * 60 * 1000;

/** How often to evaluate staleness (not how often to HTTP hit — coalesced via `requestConditionsFetch`). */
export const DEFAULT_CITYPAGE_STALE_FALLBACK_CHECK_INTERVAL_MS = 15 * 60 * 1000;

function parsePositiveIntEnv(name: string, fallback: number, min: number, max?: number): number {
  const raw = process.env[name];
  if (!raw || !/^\d+$/.test(raw.trim())) return fallback;
  let n = parseInt(raw.trim(), 10);
  if (!Number.isFinite(n)) return fallback;
  if (n < min) n = min;
  if (max != null && n > max) n = max;
  return n;
}

/** Set to `1` to disable the periodic stale check (AMQP + bootstrap HTTP only). */
export function isCitypageStaleFallbackDisabled(): boolean {
  return process.env.RWC_CITYPAGE_STALE_FALLBACK_DISABLED === "1";
}

export function citypageStaleFallbackAfterMs(): number {
  return parsePositiveIntEnv(
    "RWC_CITYPAGE_STALE_FALLBACK_AFTER_MS",
    DEFAULT_CITYPAGE_STALE_FALLBACK_AFTER_MS,
    5 * 60 * 1000
  );
}

export function citypageStaleFallbackCheckIntervalMs(): number {
  return parsePositiveIntEnv(
    "RWC_CITYPAGE_STALE_FALLBACK_CHECK_MS",
    DEFAULT_CITYPAGE_STALE_FALLBACK_CHECK_INTERVAL_MS,
    60 * 1000,
    24 * 60 * 60 * 1000
  );
}

export function shouldRunCitypageStaleHttpPoll(
  lastSuccessfulFetchIso: string | null,
  nowMs: number,
  staleAfterMs: number
): boolean {
  if (lastSuccessfulFetchIso == null || lastSuccessfulFetchIso === "") return true;
  const t = parseISO(lastSuccessfulFetchIso).getTime();
  if (!Number.isFinite(t)) return true;
  return nowMs - t >= staleAfterMs;
}
