/**
 * MSC AQHI XML may use `clock="12h"` with `ampm` on `<hour>`, or `clock="24h"` with a 0–23 value.
 * Treating 24h values as 12h shifts noon/midnight by 12 hours (#997).
 */
export function aqhiHourTo24(hour: number, isPM: boolean, clock12h: boolean): number {
  if (!Number.isFinite(hour)) return 0;
  if (!clock12h) {
    const h = Math.trunc(hour);
    return Math.max(0, Math.min(23, h));
  }
  const h = Math.trunc(hour);
  if (isPM) return h === 12 ? 12 : h + 12;
  return h === 12 ? 0 : h;
}
