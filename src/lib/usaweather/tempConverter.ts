export function convertFToC(f: number) {
  if (isNaN(f) || f === null || f === undefined) return null;
  return Number(((f - 32) * 5) / 9);
}
