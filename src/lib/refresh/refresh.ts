import { REFRESH_INTERVAL_MINUTES, REFRESH_MODE_DEFAULT, REFRESH_MODES } from "consts/refresh.consts";
import { CAPObject, RefreshMode, WeatherStation } from "types";

/** unknown/missing values (old configs) fall back to the original simulator behaviour */
export function normaliseRefreshMode(mode?: string | null): RefreshMode {
  return REFRESH_MODES.some((m) => m.value === mode) ? (mode as RefreshMode) : REFRESH_MODE_DEFAULT;
}

/** modes that hold incoming data back and only show it on a refresh */
export function isTenMinuteRefreshMode(mode?: RefreshMode) {
  return mode === "ten-minute" || mode === "ten-minute-alerts";
}

/** modes where a new alert causes a refresh of its own */
export function refreshesOnNewAlert(mode?: RefreshMode) {
  return mode === "ten-minute-alerts" || mode === "observation-changes";
}

/** milliseconds until the next multiple of REFRESH_INTERVAL_MINUTES (always > 0) */
export function msUntilNextRefresh(now: Date = new Date()) {
  const next = new Date(now.getTime());
  next.setMinutes((Math.floor(now.getMinutes() / REFRESH_INTERVAL_MINUTES) + 1) * REFRESH_INTERVAL_MINUTES, 0, 0);
  return next.getTime() - now.getTime();
}

/** a stable string for the parts of the forecast that end up on screen */
export function forecastSignature(forecast?: WeatherStation["forecast"]) {
  return (forecast ?? []).map((f) => `${f.period}|${f.abbreviatedTextSummary}`).join("\n");
}

export function alertIdentifiers(alerts?: Pick<CAPObject, "identifier">[] | null) {
  return (alerts ?? []).map((a) => a.identifier);
}

/** true if `next` has an alert that wasn't in `previous` (an alert disappearing is not "new") */
export function hasNewAlert(
  previous?: Pick<CAPObject, "identifier">[] | null,
  next?: Pick<CAPObject, "identifier">[] | null
) {
  const known = new Set(alertIdentifiers(previous));
  return alertIdentifiers(next).some((id) => !known.has(id));
}
