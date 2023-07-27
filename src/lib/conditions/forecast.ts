import { FORECAST_FOUR_LINE_WITH_PREFIX_MAX_LENGTH } from "consts/forecast.consts";

// we use this function to make sure the forecast isn't trailing off the screen (32 chars per line, 8 lines per screen, forecast generally has either 4 lines or ~2 lines)
export function abbreviateForecast(
  forecastSummary: string,
  maxCharacters: number = FORECAST_FOUR_LINE_WITH_PREFIX_MAX_LENGTH
) {
  // start with easy wins first like: "percent chance" -> "% chance", and "km/h" -> "kmh"
  let abbreviatedSummary = forecastSummary.replace(/\spercent chance/gi, "% chance").replace(/\skm\/h/gi, "");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // and now if we find a long compass direction we can change that
  abbreviatedSummary = abbreviatedSummary
    .replace(/northeast/gi, "NE")
    .replace(/southeast/gi, "SE")
    .replace(/southwest/gi, "SW")
    .replace(/northwest/gi, "NW");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // keep attacking it, aim for chance now
  abbreviatedSummary = abbreviatedSummary.replace(/chance/gi, "chnc");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // now aim for showers
  abbreviatedSummary = abbreviatedSummary.replace(/showers/gi, "shwrs");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // now aim for tstorms
  abbreviatedSummary = abbreviatedSummary.replace(/thunderstorm/gi, "tstorm");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // now aim for gusting
  abbreviatedSummary = abbreviatedSummary.replace(/\sgusting to\s/gi, "g");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // evening
  abbreviatedSummary = abbreviatedSummary.replace(/evening/gi, "eve");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // afternoon
  abbreviatedSummary = abbreviatedSummary.replace(/afternoon/gi, "aftn");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // morning
  abbreviatedSummary = abbreviatedSummary.replace(/morning/gi, "mrng");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // occasional
  abbreviatedSummary = abbreviatedSummary.replace(/occasional/gi, "ocnl");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // becoming
  abbreviatedSummary = abbreviatedSummary.replace(/becoming/gi, "bcmg");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // beginning
  abbreviatedSummary = abbreviatedSummary.replace(/beginning/gi, "bgng");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // we don't want things like "a few"
  abbreviatedSummary = abbreviatedSummary.replace(/\sa few/gi, "");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // make sure we actually return
  return abbreviatedSummary;
}
