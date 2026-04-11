import axios from "axios";

/** Short log line for failed HTTP/XML fetches (avoid dumping full Axios stacks). */
export function formatFetchError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const url = err.config?.url ?? "unknown URL";
    if (status) return `${status} ${url}`;
    return err.message || "axios error";
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

/** True if body looks like MSC climatedata XML (not an HTML error page). */
export function looksLikeClimatedataXml(body: string): boolean {
  const s = body.trimStart();
  return s.startsWith("<?xml") && s.includes("<climatedata");
}

/** True if body looks like MSC climate-normals collection CSV from api.weather.gc.ca. */
export function looksLikeClimateNormalsCsv(body: string): boolean {
  const line = body.trimStart().split(/\r?\n/)[0] ?? "";
  return line.includes("CLIMATE_IDENTIFIER") && line.includes("E_NORMAL_ELEMENT_NAME") && line.includes("MONTH");
}
