/**
 * Format 24h precip for the province screen. MSC / persisted data may use numeric 0, "NIL", etc.
 */
export function formatProvinceYesterdayPrecipDisplay(precip: string | number | null, unit: string): string {
  if (typeof precip === "string") {
    const t = precip.trim();
    if (/^(nil|n\/a)$/i.test(t)) return "TRACE";
    return precip;
  }

  if (precip == null) return "NIL".padStart(5);

  const precipNumber = Number(precip);
  if (!Number.isFinite(precipNumber)) return "NIL".padStart(5);

  const u = (unit ?? "").toLowerCase();
  const traceTh = u.includes("snow") ? 0.05 : 0.2;
  if (precipNumber === 0 || (precipNumber > 0 && precipNumber < traceTh)) return "TRACE";

  const noPrecipType = unit.length === 2;
  return `${noPrecipType ? "".padStart(2) : ""}${precipNumber.toFixed(1)} ${unit ?? "mm"}`.toUpperCase();
}
