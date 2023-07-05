export function ecccDateStringToTSDate(date: string) {
  return new Date(date.replace(" at", "").replace(",", ""));
}
