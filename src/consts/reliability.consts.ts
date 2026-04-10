/** Max age for last-known-good auxiliary API payloads (national / USA / airport METAR). */
export function rwcLkgMaxAgeMs(): number {
  return envPositiveInt("RWC_LKG_MAX_AGE_MS", 90 * 60 * 1000);
}

/** HTTP GET retries for idempotent upstream calls (total attempts = 1 + this). */
export function rwcHttpRetryCount(): number {
  const n = envPositiveInt("RWC_HTTP_RETRY_COUNT", 2);
  return Math.min(5, Math.max(0, n));
}

export function rwcHttpRetryBackoffMinMs(): number {
  return envPositiveInt("RWC_HTTP_RETRY_BACKOFF_MIN_MS", 100);
}

export function rwcHttpRetryBackoffMaxMs(): number {
  return envPositiveInt("RWC_HTTP_RETRY_BACKOFF_MAX_MS", 2000);
}

/**
 * Extra full GET cycles for the **current** UTC hourly citypage directory only (`/today/citypage_weather/<prov>/<HH>/`).
 * Mirrors often 404 for a short window right after the hour until the listing exists.
 */
export function rwcDatamartHourlyDirExtraRetries(): number {
  return Math.min(5, Math.max(0, envPositiveInt("RWC_DATAMART_HOURLY_DIR_EXTRA_RETRIES", 2)));
}

/** Pause between those publication-lag retries (ms); small jitter is added in the caller. */
export function rwcDatamartHourlyDirRetryDelayMs(): number {
  return envPositiveInt("RWC_DATAMART_HOURLY_DIR_RETRY_DELAY_MS", 12_000);
}

/** Consecutive failures before upstream host enters cool-off. */
export function rwcCircuitFailureThreshold(): number {
  return Math.min(20, Math.max(2, envPositiveInt("RWC_CIRCUIT_FAILURE_THRESHOLD", 5)));
}

export function rwcCircuitCoolOffMs(): number {
  return envPositiveInt("RWC_CIRCUIT_COOL_OFF_MS", 120_000);
}

/** Warn once at startup if free disk space is below this many MiB (0 = disabled). */
export function rwcMinDiskFreeMib(): number {
  return Math.max(0, envPositiveInt("RWC_MIN_DISK_FREE_MIB", 0));
}

function envPositiveInt(key: string, defaultVal: number): number {
  const raw = process.env[key]?.trim();
  if (!raw?.length) return defaultVal;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : defaultVal;
}
