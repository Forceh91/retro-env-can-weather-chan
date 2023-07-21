export function isWinterSeason(month?: number) {
  // remember that months are 0 indexed
  const date: Date = new Date();
  if (month === undefined) month = date?.getMonth() + 1;

  // if the month is october or greater, and march or less, its winter season
  return month >= 10 || month <= 3;
}

export function isWindchillSeason(month?: number) {
  // remember that months are 0 indexed
  const date: Date = new Date();
  if (month === undefined) month = date?.getMonth() + 1;

  // if the month is november or greater, and april or less, its windchill season
  return month >= 11 || month <= 4;
}

export function isSunSpotSeason(month?: number) {
  const date: Date = new Date();
  if (month === undefined) month = date?.getMonth() + 1;

  // if the month is feb/march then its sunspot season
  return month >= 2 && month < 4;
}
