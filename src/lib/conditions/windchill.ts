export function calculateWindchill(temperature: number, windSpeed: number) {
  // no windchill if the temp is over 0
  if (temperature > 0) return null;

  // the old windchill system was a number based off temp and wind speed, rather than just a random temp
  // this is calculated as below, then rounded up to the nearest 50, if its >= 1200 then windchill should be shown
  // providing that the wind speed is over 10
  const windSpeedMs = windSpeed / 3.6;

  const windchill = Math.floor(
    (12.1452 + 11.6222 * Math.sqrt(windSpeedMs) - 1.16222 * windSpeedMs) * (33 - temperature)
  );

  // round it to nearest 50 and if its >= 1200 with a windspeed >= 10 its relevant
  const roundedWindchill = Math.round(windchill / 50) * 50;
  return roundedWindchill >= 1200 && windSpeed >= 10 ? roundedWindchill : null;
}
