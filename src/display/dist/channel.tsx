import { FooterBar } from "display/components/footerbar";
import { ScreenRotator } from "display/components/screenrotator";
import {
  useAlerts,
  useCanadaHotColdSpots,
  useLastMonth,
  useUSAWeather,
  useProvinceTracking,
  useSeason,
  useWeatherEventStream,
  useNationalWeather,
} from "hooks";
import { useConfig } from "hooks/init";
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

function WeatherChannel() {
  const { config } = useConfig();
  const { currentConditions } = useWeatherEventStream();
  const alertsHook = useAlerts();
  const { nationalWeather } = useNationalWeather();
  const { provinceTracking } = useProvinceTracking();
  const { season, fetchSeason } = useSeason();
  const { hotColdSpots } = useCanadaHotColdSpots();
  const { lastMonth, fetchLastMonth } = useLastMonth();
  const { usaWeather } = useUSAWeather();

  useEffect(() => {
    fetchSeason();
    fetchLastMonth();
  }, [currentConditions?.observationID]);

  return (
    <>
      <div id="crawler_bar"></div>
      <div id="display">
        <ScreenRotator
          screens={config?.flavour?.screens}
          weatherStationResponse={currentConditions}
          alerts={alertsHook}
          nationalWeather={nationalWeather}
          provinceTracking={provinceTracking}
          season={season}
          hotColdSpots={hotColdSpots}
          lastMonth={lastMonth}
          usaWeather={usaWeather}
        />
      </div>
      <FooterBar timeOffset={currentConditions?.stationTime?.stationOffsetMinutesFromLocal ?? 0} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("weather_channel") as HTMLElement);
root &&
  root.render(
    <React.StrictMode>
      <WeatherChannel />
    </React.StrictMode>
  );
