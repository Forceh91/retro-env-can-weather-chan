import { useEffect, useRef, useState } from "react";
import { CAPObject, RefreshMode, WeatherStation } from "types";
import {
  alertIdentifiers,
  forecastSignature,
  hasNewAlert,
  isTenMinuteRefreshMode,
  msUntilNextRefresh,
  refreshesOnNewAlert,
} from "lib/refresh";

type Snapshot = { conditions?: WeatherStation; alerts: CAPObject[] };

/**
 * Decides *when* new data is allowed to reach the screen, and hands out a `refreshID` that changes every time
 * the channel should replay its reload (back to the forecast, refresh animation).
 *
 * - `observation` / `observation-changes`: data passes straight through, only the refresh trigger differs.
 * - `ten-minute` / `ten-minute-alerts`: incoming data is held and committed on the :00/:10/:20... clock
 *   (and, for `ten-minute-alerts`, whenever a new alert shows up). Nothing else happens in real time.
 */
export function useRefreshGate(mode: RefreshMode, liveConditions: WeatherStation | undefined, liveAlerts: CAPObject[]) {
  const [refreshID, setRefreshID] = useState(0);
  const [held, setHeld] = useState<Snapshot>({ alerts: [] });

  const live = useRef<Snapshot>({ alerts: [] });
  live.current = { conditions: liveConditions, alerts: liveAlerts };

  const seen = useRef({ observationID: "", forecast: "", alerts: [] as string[] });
  const heldRef = useRef<Snapshot>(held);
  heldRef.current = held;

  const refresh = () => setRefreshID((id) => id + 1);
  const commit = () => {
    setHeld({ conditions: live.current.conditions, alerts: live.current.alerts });
    refresh();
  };

  // pass-through modes: work out whether this change deserves a refresh
  const forecastKey = forecastSignature(liveConditions?.forecast);
  const alertKey = alertIdentifiers(liveAlerts).join("|");
  useEffect(() => {
    if (isTenMinuteRefreshMode(mode)) return;
    if (!liveConditions?.observationID) return;

    const previous = seen.current;
    const isFirst = !previous.observationID;
    const newObservation = liveConditions.observationID !== previous.observationID;
    const newForecast = mode === "observation-changes" && forecastKey !== previous.forecast;
    const newAlert =
      refreshesOnNewAlert(mode) &&
      hasNewAlert(
        previous.alerts.map((identifier) => ({ identifier })),
        liveAlerts
      );

    seen.current = {
      observationID: liveConditions.observationID,
      forecast: forecastKey,
      alerts: alertIdentifiers(liveAlerts),
    };
    if (isFirst || newObservation || newForecast || newAlert) refresh();
  }, [mode, liveConditions?.observationID, forecastKey, alertKey]);

  // ten minute modes: first data shows immediately, after that it's the clock
  useEffect(() => {
    if (!isTenMinuteRefreshMode(mode)) return;
    if (heldRef.current.conditions || !liveConditions) return;
    commit();
  }, [mode, !!liveConditions]);

  useEffect(() => {
    if (!isTenMinuteRefreshMode(mode)) return;

    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeout = setTimeout(() => {
        commit();
        schedule();
      }, msUntilNextRefresh());
    };
    schedule();

    return () => clearTimeout(timeout);
  }, [mode]);

  // ten-minute-alerts: a new alert gets its own refresh
  useEffect(() => {
    if (mode !== "ten-minute-alerts" || !heldRef.current.conditions) return;
    if (hasNewAlert(heldRef.current.alerts, liveAlerts)) commit();
  }, [mode, alertKey]);

  if (!isTenMinuteRefreshMode(mode)) return { conditions: liveConditions, alerts: liveAlerts, refreshID };
  return { conditions: held.conditions, alerts: held.alerts, refreshID };
}
