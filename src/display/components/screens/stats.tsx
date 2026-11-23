import { DISPLAY_MAX_CHARACTERS_PER_LINE } from "consts";
import { addMinutes, format, isValid, parseISO } from "date-fns";
import { formatObservedMonthDate, getIsWinterSeason } from "lib/date";
import { centreOnGrid } from "lib/display";
import { useMemo } from "react";
import { HotColdSpots, Season, SunRiseSet, WeatherStationTimeData } from "types";

type StatsScreenProps = {
  city: string;
  weatherStationTime: WeatherStationTimeData;
  season: Season;
  sunRiseSet: SunRiseSet;
  hotColdSpots: HotColdSpots;
};

// the dotted precip lines run to the last column of the grid on the original
const PRECIP_CHARS_USED_OUTSIDE_OF_DOTS = 15;
const NORMAL_PRECIP_CHARS_USED_OUTSIDE_OF_DOTS = 11;
// the hot/cold spot lines are a block that starts on column 2 and has the temperature ending on column 27
const HOT_COLD_SPOT_START_COLUMN = 2;
const HOT_COLD_SPOT_END_COLUMN = 27;
const HOT_COLD_SPOT_TEMPERATURE_LENGTH = 3;

export function StatsScreen(props: StatsScreenProps) {
  const { city, weatherStationTime, season: seasonStats, sunRiseSet, hotColdSpots } = props ?? {};

  const { season, seasonPrecip } = seasonStats ?? {};
  const winterSnowCm =
    getIsWinterSeason() && seasonPrecip?.snowfallSeasonCm != null && seasonPrecip.snowfallSeasonCm > 0
      ? seasonPrecip.snowfallSeasonCm
      : null;

  const parseDate = (isoDate: string) => parseISO(isoDate);

  const formattedDate = useMemo(
    () => weatherStationTime?.observedDateTime && formatObservedMonthDate(weatherStationTime, true),
    [weatherStationTime?.observedDateTime]
  );

  const formattedShortDate = useMemo(
    () => weatherStationTime?.observedDateTime && formatObservedMonthDate(weatherStationTime),
    [weatherStationTime?.observedDateTime]
  );

  // the month is spelled out like the original ("MARCH 26") unless that doesn't fit on the line ("SEPTEMBER 28")
  const titleLine = () => {
    const city10 = city.slice(0, 10);
    const long = `${city10} statistics - ${formattedDate}`;
    return long.length <= DISPLAY_MAX_CHARACTERS_PER_LINE ? long : `${city10} statistics - ${formattedShortDate}`;
  };

  const formattedHotColdSpotDate = useMemo(() => {
    const date = parseDate(hotColdSpots?.lastUpdated);
    if (!isValid(date)) return "";

    return format(addMinutes(date, weatherStationTime?.stationOffsetMinutesFromLocal ?? 0), "MMM d");
  }, [hotColdSpots?.lastUpdated, weatherStationTime?.stationOffsetMinutesFromLocal]);

  const formattedSunrise = useMemo(() => {
    const date = parseDate(sunRiseSet?.rise);
    if (!isValid(date)) return "";

    return format(addMinutes(date, weatherStationTime?.stationOffsetMinutesFromLocal ?? 0), "h:mm");
  }, [sunRiseSet?.rise, weatherStationTime?.stationOffsetMinutesFromLocal]);

  const formattedSunset = useMemo(() => {
    const date = parseDate(sunRiseSet?.set);
    if (!isValid(date)) return "";

    return format(addMinutes(date, weatherStationTime?.stationOffsetMinutesFromLocal ?? 0), "h:mm");
  }, [sunRiseSet?.set, weatherStationTime?.stationOffsetMinutesFromLocal]);

  // "Sunrise..6:10 am Sunset..10:25 pm" is 33 columns so when it's too long the am/pm gets tucked in against the time
  const sunriseSunsetLine = () => {
    const line = `Sunrise..${formattedSunrise} am Sunset..${formattedSunset} pm`;
    if (line.length <= DISPLAY_MAX_CHARACTERS_PER_LINE) return line;

    return `Sunrise..${formattedSunrise}am Sunset..${formattedSunset}pm`;
  };

  const generatePrecip = (amount: number) => amount.toFixed(1).padStart(5);

  const generateDotsForPrecipLine = (dataName: string, usedChars = PRECIP_CHARS_USED_OUTSIDE_OF_DOTS) =>
    "".padEnd(DISPLAY_MAX_CHARACTERS_PER_LINE - (dataName.length + usedChars), ".");

  const seasonStartMonth = getIsWinterSeason() ? "October" : "April";
  const normalPrecip = generatePrecip(seasonPrecip?.normal || 0);
  /** When bulk winter snow exists, MSC-style plate uses snow as the seasonal total (not liquid + snow). */
  const showSnowfallAsSeasonalTotal = winterSnowCm != null;
  const actualPrecip = generatePrecip(seasonPrecip?.amount || 0);

  const { hotSpot, coldSpot } = hotColdSpots ?? {};

  const formatTempForHotColdSpotLine = (temperature?: number | null) =>
    (!isNaN(temperature) && temperature != null ? Math.round(temperature) : "N/A").toString();

  // "  Name, PR ......-42". like the original both lines are the same width, from the start column to the end column,
  // with the dots running right up to the temperature. the name is cut (and any dangling " /" or "," dropped) so that
  // there's room for the province, one dot and the widest temperature
  const formatHotColdSpotLine = (name: string, province: string, temperature?: number | null) => {
    const suffix = `, ${province} `;
    const width = HOT_COLD_SPOT_END_COLUMN - HOT_COLD_SPOT_START_COLUMN;
    const maxName = width - suffix.length - 1 - HOT_COLD_SPOT_TEMPERATURE_LENGTH;
    const shortName = (name ?? "N/A").slice(0, maxName).replace(/[\s/,\-]+$/, "");

    const temp = formatTempForHotColdSpotLine(temperature);
    const dots = "".padEnd(width - shortName.length - suffix.length - temp.length, ".");

    return `${"".padStart(HOT_COLD_SPOT_START_COLUMN)}${shortName}${suffix}${dots}${temp}`;
  };

  if (!city || !weatherStationTime?.observedDateTime || !season || !hotColdSpots) return <></>;

  return (
    <div id="stats_screen">
      <div>{centreOnGrid(titleLine())}</div>
      <div>{sunriseSunsetLine()}</div>
      {!showSnowfallAsSeasonalTotal && (
        <>
          <div>{centreOnGrid("Total precipitation since")}</div>
          <div>
            {"".padStart(2)}
            {seasonStartMonth} 1st {generateDotsForPrecipLine(seasonStartMonth)}
            {actualPrecip} mm
          </div>
        </>
      )}
      {showSnowfallAsSeasonalTotal && (
        <>
          <div>{centreOnGrid("Total snowfall since")}</div>
          <div>
            {"".padStart(2)}
            {seasonStartMonth} 1st {generateDotsForPrecipLine(seasonStartMonth)}
            {generatePrecip(winterSnowCm)} cm
          </div>
        </>
      )}
      <div>
        {"".padStart(2)}
        Normal {generateDotsForPrecipLine("Normal", NORMAL_PRECIP_CHARS_USED_OUTSIDE_OF_DOTS)}
        {normalPrecip} mm
      </div>
      {hotColdSpots && (
        <>
          <div>Canadian Hot/Cold Spot - {formattedHotColdSpotDate}</div>
          {hotSpot && <div>{formatHotColdSpotLine(hotSpot.name, hotSpot.province, hotSpot.temperature)}</div>}
          {coldSpot && (
            <div>{formatHotColdSpotLine(coldSpot.name, coldSpot.province ?? "N/A", coldSpot.temperature)}</div>
          )}
        </>
      )}
    </div>
  );
}
