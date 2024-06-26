import { AQHIObservationResponse, WeatherStation } from "types";
import { Conditions } from "../weather";

type AlmanacScreenProps = {
  weatherStationResponse: WeatherStation;
  airQuality: AQHIObservationResponse;
};

const TEMPERATURE_STRING_LENGTH = 5;

export function AlmanacScreen(props: AlmanacScreenProps) {
  const { weatherStationResponse, airQuality } = props ?? {};
  const { city, observed, stationTime, almanac } = weatherStationResponse ?? {};

  // no response from weather station so whatever
  if (!weatherStationResponse) return <></>;

  const formatTemperature = (temperature: number, length: number = TEMPERATURE_STRING_LENGTH) =>
    (temperature?.toFixed(1).toString() ?? "N/A").padStart(length);

  const lastYear = {
    hi: formatTemperature(almanac?.temperatures?.lastYearMax?.value),
    lo: formatTemperature(almanac?.temperatures?.lastYearMin?.value),
  };

  const normal = {
    hi: formatTemperature(almanac?.temperatures?.normalMax?.value, 6),
    lo: formatTemperature(almanac?.temperatures?.normalMin?.value, 6),
  };

  const record = {
    hi: `${formatTemperature(almanac?.temperatures?.extremeMax?.value, 6)} in ${
      almanac?.temperatures?.extremeMax?.year ?? "N/A"
    }`,
    lo: `${formatTemperature(almanac?.temperatures?.extremeMin?.value, 6)} in ${
      almanac?.temperatures?.extremeMin?.year ?? "N/A"
    }`,
  };

  // the extra spaces in the table below are intentional. Last year is meant to have a space before it.
  return (
    <div>
      <Conditions city={city} conditions={observed} stationTime={stationTime} showPressure airQuality={airQuality} />

      <div> Last Year Normal Records{"".padEnd(2)}Year</div>
      <div>
        {"Hi".padStart(3)} {lastYear.hi} {normal.hi} {record.hi}
      </div>
      <div>
        {"Lo".padStart(3)} {lastYear.lo} {normal.lo} {record.lo}
      </div>
    </div>
  );
}
