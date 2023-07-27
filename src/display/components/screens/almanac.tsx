import { WeatherStation } from "types";
import { Conditions } from "../weather";

type AlmanacScreenProps = {
  weatherStationResponse: WeatherStation;
};

export function AlmanacScreen(props: AlmanacScreenProps) {
  const { weatherStationResponse } = props ?? {};
  const { city, observed, stationTime } = weatherStationResponse ?? {};

  // no response from weather station so whatever
  if (!weatherStationResponse) return <></>;

  return (
    <>
      <Conditions city={city} conditions={observed} stationTime={stationTime} showPressure />
    </>
  );
}
