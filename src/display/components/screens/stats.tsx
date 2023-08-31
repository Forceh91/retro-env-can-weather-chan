import { DISPLAY_MAX_CHARACTERS_PER_LINE } from "consts";
import { addMinutes, format, isValid, parseISO } from "date-fns";
import { formatObservedMonthDate, getIsWinterSeason } from "lib/date";
import { useMemo } from "react";
import { HotColdSpots, Season, SunRiseSet, WeatherStationTimeData } from "types";

type StatsScreenProps = {
  city: string;
  weatherStationTime: WeatherStationTimeData;
  season: Season;
  sunRiseSet: SunRiseSet;
  hotColdSpots: HotColdSpots;
};

const PRECIP_CHARS_USED_OUTSIDE_OF_DOTS = 16;
const NORMAL_PRECIP_CHARS_USED_OUTSIDE_OF_DOTS = 12;
const HOT_COLD_SPOT_CHARS_USED_OUTSIDE_OF_DOTS = 9;
const HOT_COLD_SPOT_MAX_NAME_LENGTH = 20;

export function StatsScreen(props: StatsScreenProps) {
  const { city, weatherStationTime, season: seasonStats, sunRiseSet, hotColdSpots } = props ?? {};

  const { season, seasonPrecip } = seasonStats ?? {};

  const parseDate = (isoDate: string) => parseISO(isoDate);

  const formattedDate = useMemo(
    () => weatherStationTime?.observedDateTime && formatObservedMonthDate(weatherStationTime, true),
    [weatherStationTime?.observedDateTime]
  );

  const formattedHotColdSpotDate = useMemo(() => {
    const date = parseDate(hotColdSpots?.lastUpdated);
    if (!isValid(date)) return "";

    return format(addMinutes(date, weatherStationTime?.stationOffsetMinutesFromLocal), "MMM d");
  }, [hotColdSpots?.lastUpdated]);

  const formattedSunrise = useMemo(() => {
    const date = parseDate(sunRiseSet?.rise);
    if (!isValid(date)) return "";

    return format(addMinutes(date, weatherStationTime?.stationOffsetMinutesFromLocal), "h:mm");
  }, [sunRiseSet?.rise]);

  const formattedSunset = useMemo(() => {
    const date = parseDate(sunRiseSet?.set);
    if (!isValid(date)) return "";

    return format(addMinutes(date, weatherStationTime?.stationOffsetMinutesFromLocal), "h:mm");
  }, [sunRiseSet?.set]);

  const generatePrecip = (amount: number) => amount.toFixed(1).toString().padStart(5);

  const generateDotsForPrecipLine = (dataName: string, usedChars = PRECIP_CHARS_USED_OUTSIDE_OF_DOTS) =>
    "".padEnd(DISPLAY_MAX_CHARACTERS_PER_LINE - (dataName.length + usedChars), ".");

  const seasonStartMonth = getIsWinterSeason() ? "October" : "April";
  const actualPrecip = generatePrecip(seasonPrecip?.amount || 0);
  const normalPrecip = generatePrecip(seasonPrecip?.normal || 0);

  const { hotSpot, coldSpot } = hotColdSpots ?? {};
  const truncatedHotSpotName = hotSpot?.name?.slice(0, HOT_COLD_SPOT_MAX_NAME_LENGTH) ?? "";
  const truncatedColdSpotName = coldSpot?.name?.slice(0, HOT_COLD_SPOT_MAX_NAME_LENGTH) ?? "";

  const generateDotsForHotColdSpotLine = (prefix: string) =>
    "".padEnd(DISPLAY_MAX_CHARACTERS_PER_LINE - (prefix.length + HOT_COLD_SPOT_CHARS_USED_OUTSIDE_OF_DOTS), ".");

  const formatTempForHotColdSpotLine = (temperature?: number) =>
    (!isNaN(temperature) ? Math.round(temperature) : "N/A").toString().padStart(3);

  if (!city || !weatherStationTime?.observedDateTime || !season || !hotColdSpots) return <></>;

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
      {hotColdSpots && (
        <>
          <div>Canadian Hot/Cold Spot - {formattedHotColdSpotDate}</div>
          {hotSpot && (
            <div>
              {truncatedHotSpotName}, {hotSpot.province} {generateDotsForHotColdSpotLine(truncatedHotSpotName)}
              {formatTempForHotColdSpotLine(hotSpot.temperature)}
            </div>
          )}
          {coldSpot && (
            <div>
              {truncatedColdSpotName}, {coldSpot.province} {generateDotsForHotColdSpotLine(truncatedColdSpotName)}
              {formatTempForHotColdSpotLine(coldSpot.temperature)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
