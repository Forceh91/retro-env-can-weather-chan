import type { TemperatureRecord } from "types";

/**
 * MSC English citypage XML includes daily record high/low under `<almanac><temperature class="extremeMax|extremeMin">`.
 * ec-weather-js sometimes omits these when building `all.almanac`, which leaves Records/Year as N/A on the almanac screen.
 * Parse the raw XML as a fallback when structured parse has null extremes.
 */
export function parseAlmanacExtremesFromCitypageXml(xml: string): {
  extremeMax: TemperatureRecord | null;
  extremeMin: TemperatureRecord | null;
} {
  const extremeMax = parseOneExtreme(xml, "extremeMax");
  const extremeMin = parseOneExtreme(xml, "extremeMin");
  return { extremeMax, extremeMin };
}

function parseOneExtreme(xml: string, kind: "extremeMax" | "extremeMin"): TemperatureRecord | null {
  if (xml == null || xml === "") return null;

  const re = new RegExp(
    `<temperature\\b[^>]*\\bclass=["']${kind}["'][^>]*>([-\\d.]+)</temperature>`,
    "i"
  );
  const m = re.exec(xml);
  if (!m) return null;

  const value = Number(m[1]);
  if (!Number.isFinite(value)) return null;

  const full = m[0];
  const openEnd = full.indexOf(">");
  const openTag = openEnd === -1 ? full : full.slice(0, openEnd + 1);
  const yearM = /year=["'](\d{4})["']/i.exec(openTag);
  const year = yearM ? parseInt(yearM[1], 10) : undefined;

  return {
    value,
    unit: "C",
    ...(Number.isFinite(year) ? { year } : {}),
  };
}
