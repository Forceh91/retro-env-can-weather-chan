import { DISPLAY_MAX_CHARACTERS_PER_LINE } from "consts";
import { format, isValid, parseISO, subMinutes } from "date-fns";
import { formatObservedMonthDate } from "lib/date";
import { useMemo } from "react";
import { Season, SunRiseSet, WeatherStationTimeData } from "types";

type StatsScreenProps = {
  city: string;
  weatherStationTime: WeatherStationTimeData;
  season: Season;
  sunRiseSet: SunRiseSet;
};

const PRECIP_CHARS_USED_OUTSIDE_OF_DOTS = 16;
const NORMAL_PRECIP_CHARS_USED_OUTSIDE_OF_DOTS = 12;

export function StatsScreen(props: StatsScreenProps) {
  const {
    city,
    weatherStationTime,
    season: { season, seasonPrecip },
    sunRiseSet,
  } = props ?? {};

  const parseDate = (isoDate: string) => parseISO(isoDate);

  const formattedDate = useMemo(
    () => formatObservedMonthDate(weatherStationTime, true),
    [weatherStationTime?.observedDateTime]
  );

  const formattedSunrise = useMemo(() => {
    const date = parseDate(sunRiseSet?.rise);
    if (!isValid(date)) return "";

    return format(subMinutes(date, weatherStationTime?.stationOffsetMinutesFromLocal), "h:mm");
  }, [sunRiseSet?.rise]);

  const formattedSunset = useMemo(() => {
    const date = parseDate(sunRiseSet?.set);
    if (!isValid(date)) return "";

    return format(subMinutes(date, weatherStationTime?.stationOffsetMinutesFromLocal), "h:mm");
  }, [sunRiseSet?.set]);

  const generatePrecip = (amount: number) => amount.toFixed(1).toString().padStart(5);

  const generateDotsForPrecipLine = (dataName: string, usedChars = PRECIP_CHARS_USED_OUTSIDE_OF_DOTS) =>
    "".padEnd(DISPLAY_MAX_CHARACTERS_PER_LINE - (dataName.length + usedChars), ".");

  const seasonStartMonth = season?.winter ? "October" : "April";
  const actualPrecip = generatePrecip(seasonPrecip?.amount || 0);
  const normalPrecip = generatePrecip(seasonPrecip?.normal || 0);

  if (!city || !weatherStationTime?.observedDateTime) return <></>;

  return (
    <div id="stats_screen">
      <div>
        {"".padStart(2)}
        {city.slice(0, 10)} statistics - {formattedDate}
      </div>
      <div>
        Sunrise..{formattedSunrise} am Sunset..{formattedSunset} pm
      </div>
      <div>{"".padStart(4)}Total precipitation since</div>
      <div>
        {"".padStart(2)}
        {seasonStartMonth} 1st {generateDotsForPrecipLine(seasonStartMonth)}
        {actualPrecip} mm
      </div>
      <div>
        {"".padStart(2)}
        Normal {generateDotsForPrecipLine("Normal", NORMAL_PRECIP_CHARS_USED_OUTSIDE_OF_DOTS)}
        {normalPrecip} mm
      </div>
    </div>
  );
}
