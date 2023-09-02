import { CrawlerMessages } from "display/components/crawler";
import { FooterBar } from "display/components/footerbar";
import { PlaylistComponent } from "display/components/playlist";
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
  useSunspots,
} from "hooks";
import { useAirQuality } from "hooks/airQuality";
import { useConfig } from "hooks/init";
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

function WeatherChannel() {
  const { config } = useConfig();
  const { currentConditions } = useWeatherEventStream();
  const alertsHook = useAlerts();
  const { nationalWeather, fetchNationalWeather } = useNationalWeather();
  const { provinceTracking } = useProvinceTracking();
  const { season, fetchSeason } = useSeason();
  const { hotColdSpots } = useCanadaHotColdSpots();
  const { lastMonth, fetchLastMonth } = useLastMonth();
  const { usaWeather } = useUSAWeather();
  const { sunspots } = useSunspots();
  const { airQuality } = useAirQuality();

  useEffect(() => {
    fetchSeason();
    fetchLastMonth();
    fetchNationalWeather();
  }, [currentConditions?.observationID]);

  if (
    !config &&
    !currentConditions &&
    !alertsHook.alerts &&
    !nationalWeather &&
    !provinceTracking &&
    !season &&
    !hotColdSpots &&
    !lastMonth &&
    !usaWeather &&
    !sunspots
  )
    return <>Channel offline</>;

  return (
    <>
      <CrawlerMessages crawler={config?.crawler} />
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
        sunspots={sunspots}
        airQuality={airQuality}
        configVersion={config?.config.configVersion}
      />
      <FooterBar timeOffset={currentConditions?.stationTime?.stationOffsetMinutesFromLocal ?? 0} />
      <PlaylistComponent playlist={config?.music} />
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
