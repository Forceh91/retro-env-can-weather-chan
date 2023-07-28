import { CAPObject, CAPSeverity } from "types";

export function shouldAlertFlash(alert: CAPObject) {
  if (!alert) return false;

  // doing this because these seem to get sent over as at least moderate. but we also want some things that are moderate to flash
  if (["statement", "advisory"].some((warningType) => alert.headline?.toLowerCase().includes(warningType)))
    return false;

  return alert.severity >= CAPSeverity.MODERATE;
}
