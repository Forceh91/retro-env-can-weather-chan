import { useEffect } from "react";
import { WeatherStation } from "types";
import { AutomaticScreenProps } from "types/screen.types";
import { Conditions } from "../weather";

type ForecastScreenProps = {
  weatherStationResponse: WeatherStation;
};

export function ForecastScreen(props: ForecastScreenProps & AutomaticScreenProps) {
  const { onComplete, weatherStationResponse } = props ?? {};

  // useEffect(() => {
  //   setTimeout(() => typeof onComplete === "function" && onComplete(), 10 * 1000);
  // });

  if (!weatherStationResponse) return <></>;

  return (
    <>
      <Conditions
        city={weatherStationResponse.city}
        conditions={weatherStationResponse.observed}
        stationTime={weatherStationResponse.stationTime}
      />
    </>
  );
}
