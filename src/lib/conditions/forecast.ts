import { FORECAST_FOUR_LINE_WITH_PREFIX_MAX_LENGTH } from "consts/forecast.consts";

// we use this function to make sure the forecast isn't trailing off the screen (32 chars per line, 8 lines per screen, forecast generally has either 4 lines or ~2 lines)
export function abbreviateForecast(
  forecastSummary: string,
  maxCharacters: number = FORECAST_FOUR_LINE_WITH_PREFIX_MAX_LENGTH
) {
  // start with easy wins first like: "percent chance" -> "% chance", and "km/h" -> "kmh"
  let abbreviatedSummary = forecastSummary.replace(/\spercent chance/gi, "% chance").replace(/\skm\/h/gi, "");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // turn ZERO into just the number 0
  abbreviatedSummary = abbreviatedSummary.replace(/zero/gi, "0");

  // now we want to find PLUS 1-5 and change that into +number
  abbreviatedSummary = abbreviatedSummary.replace(/plus ([1-5])/gi, "+$1");

  // now we want to find PLUS number and change that into just number
  abbreviatedSummary = abbreviatedSummary.replace(/plus (\d+)/gi, "$1");

  // now we want to find MINUS number and change that into just -number
  abbreviatedSummary = abbreviatedSummary.replace(/minus (\d+)/gi, "-$1");

  // and now if we find a long compass direction we can change that
  abbreviatedSummary = abbreviatedSummary
    .replace(/northeast/gi, "NE")
    .replace(/southeast/gi, "SE")
    .replace(/southwest/gi, "SW")
    .replace(/northwest/gi, "NW");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // in outlying areas
  abbreviatedSummary = abbreviatedSummary.replace(/in outlying areas\s/gi, "");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // developing doesn't need to be there (fog patches developing overnight)
  abbreviatedSummary = abbreviatedSummary.replace(/developing\s/gi, "");
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

  // partly cloudy
  abbreviatedSummary = abbreviatedSummary.replace(/partly cloudy/gi, "ptly cldy");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // (a) mix of sun and cloud
  abbreviatedSummary = abbreviatedSummary.replace(/(a\s)?mix of sun and cloud/gi, "mix sun/cld");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // blowing snow
  abbreviatedSummary = abbreviatedSummary.replace(/blowing snow/gi, "blwg snow");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // flurries
  abbreviatedSummary = abbreviatedSummary.replace(/flurries/gi, "flrys");
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

  // midnight
  abbreviatedSummary = abbreviatedSummary.replace(/midnight/gi, "12am");
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

  // increasing
  abbreviatedSummary = abbreviatedSummary.replace(/increasing/gi, "incr");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // diminishing
  abbreviatedSummary = abbreviatedSummary.replace(/diminishing/gi, "dmnshg");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // still no space so the short compass directions
  abbreviatedSummary = abbreviatedSummary
    .replace(/north/gi, "N")
    .replace(/east/gi, "E")
    .replace(/south/gi, "S")
    .replace(/west/gi, "W");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // we don't want things like "a few"
  abbreviatedSummary = abbreviatedSummary.replace(/\sa few/gi, "");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // with turns into w/
  abbreviatedSummary = abbreviatedSummary.replace(/with/gi, "w/");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // squish up the precip amount predicitons
  abbreviatedSummary = abbreviatedSummary.replace(/amount (\d+) (-|to) (\d+) mm/gi, "amount $1-$3mm");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // squish up the snowfall amount predicitons
  abbreviatedSummary = abbreviatedSummary.replace(/amount (\d+) (-|to) (\d+) cm/gi, "amount $1-$3cm");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // temperature steady
  abbreviatedSummary = abbreviatedSummary.replace(/temperature/gi, "temp");
  if (abbreviatedSummary.length <= maxCharacters) return abbreviatedSummary;

  // percent chance changing to percent chance (to percent chance)
  if (abbreviatedSummary.includes("near"))
    abbreviatedSummary = abbreviatedSummary.replace(
      /(\d+)% chnc (.+?) changing to (\d+)% chnc .+(noon|12am)/g,
      "$1-$3% chnc $2 until $4"
    );
  else
    abbreviatedSummary = abbreviatedSummary.replace(
      /(\d+)% chnc (.+?) changing to (\d+)% chnc (.+)/g,
      "$1-$3% chnc $4"
    );

  // make sure we actually return
  return abbreviatedSummary;
}
