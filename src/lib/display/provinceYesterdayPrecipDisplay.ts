/**
 * Format 24h precip for the province screen.
 * MSC: NIL for amounts below reporting threshold (0.2 mm liquid, 0.05 cm snow) including numeric zero,
 * and for the literal token NIL (no detectable precipitation). N/A means data not available → MISSING.
 * TRACE only when the feed is explicitly trace; MISSING for null / non-finite / M / N/A / missing sentinel.
 */
const NIL_PAD = "NIL".padStart(5);

export function formatProvinceYesterdayPrecipDisplay(precip: string | number | null, unit: string): string {
  if (typeof precip === "string") {
    const t = precip.trim();
    if (t === "") return "MISSING";
    if (/^trace$/i.test(t)) return "TRACE";
    if (/^(missing|m|n\/a)$/i.test(t)) return "MISSING";
    if (/^nil$/i.test(t)) return NIL_PAD;
    return precip;
  }

  if (precip == null) return "MISSING";

  const precipNumber = Number(precip);
  if (!Number.isFinite(precipNumber)) return "MISSING";

  const u = (unit ?? "").toLowerCase();
  const traceTh = u.includes("snow") ? 0.05 : 0.2;
  if (precipNumber === 0 || (precipNumber > 0 && precipNumber < traceTh)) return NIL_PAD;

  const noPrecipType = unit.length === 2;
  return `${noPrecipType ? "".padStart(2) : ""}${precipNumber.toFixed(1)} ${unit ?? "mm"}`.toUpperCase();
}
