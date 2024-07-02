import { MAX_CONDITION_LENGTH } from "consts";

export function truncateConditions(condition: string) {
  if (!condition) return "";

  if (condition.includes("with")) condition = condition.split(" with")[0];
  if (condition.includes("and")) condition = condition.split(" and")[0];
  if (condition.includes("then")) condition = condition.split(" then")[0];
  return `${condition.slice(0, 16)}`;
}

export function harshTruncateConditions(
  condition: string,
  maxLength: number = MAX_CONDITION_LENGTH,
  isUSForecast: boolean = false
) {
  // to lowercase
  condition = (condition ?? "").toLowerCase();

  // handle thunderstorm when its prefaced with light/heavy
  if (condition.includes("light thunderstorm") || condition.includes("heavy thunderstorm"))
    condition = condition.replace(/thunderstorm/gi, "tstorm");

  // handle light snow
  condition = condition.replace(/(light|heavy) (rain|snow) and (snow|rain)/gi, "rain/snow");

  // handle light/heavy freezing rain
  condition = condition.replace(/(light|heavy) freezing rain/gi, "$1 frzg rain");

  // handle snow + blowing snow
  condition = condition.replace(/(light|heavy) snow (shower\s)?and blowing snow/gi, "snow/blw snow");

  // handle light/heavy freezing drizzle
  condition = condition.replace(/(light|heavy) freezing drizzle/gi, "$1 frzg drzl");

  // light/heavy rain + drizzle
  condition = condition.replace(/(light|heavy) rain and drizzle/gi, "$1 rain/drzl");

  // remove (and) fog/mist if prefixed with a space
  condition = condition.replace(/(?!freezing|areas of|patchy)\s((and? fog(\/mist)?)|fog\/mist)/gi, "");

  // some us forecasts are wild
  if (isUSForecast) condition = truncateForecastConditions(condition);

  // handle light/heavy conditions
  if (condition.length > maxLength) condition = condition.replace(/light/gi, "lgt").replace(/heavy/gi, "hvy");

  // handle light/heavy rain/snow shower
  condition = condition.replace(/\s(rain|snow)shower/gi, " $1shwr");

  // final truncation for and/width/then
  condition = truncateConditions(condition);

  // now truncate to just maxLength chars
  return `${condition.slice(0, maxLength)}`;
}

export function truncateForecastConditions(condition: string) {
  // forecast truncation for sunspots page (12 chars max here)
  // isolated rain showers (then...)
  condition = condition.replace(/isolated rain showers/gi, "isld showers");

  // isolated showers and thunderstorms
  condition = condition.replace(/isolated showers and thunderstorms/gi, "i. shwr/strm");

  // slight chance (rain) showers
  condition = condition.replace(/(slight\s)?chance(\srain)? showers?/gi, "chnc showers");

  // slight chance rain (because thats different to showers, lol)
  condition = condition.replace(/(slight\s)?chance rain/gi, "chnc rain");

  // slight chance light/heavy rain
  condition = condition.replace(/(slight\s)?chance (light|heavy) rain/gi, "chc $2 rain");

  // scattered (rain) showers
  condition = condition.replace(/scattered(\srain)?\sshowers/gi, "sctd showers");

  // mostly cloudy
  condition = condition.replace(/mostly cloudy/gi, "mostly cldy");
  return condition;
}
