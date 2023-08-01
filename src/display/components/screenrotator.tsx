import { useEffect, useRef, useState } from "react";
import { Screens } from "consts";
import { isAutomaticScreen } from "lib/flavour/utils";
import {
  CAPObject,
  FlavourScreen,
  HotColdSpots,
  NationalWeather,
  ProvinceTracking,
  Season,
  WeatherStation,
} from "types";
import {
  AlmanacScreen,
  ForecastScreen,
  AlertScreen,
  OutlookScreen,
  NationalWeatherScreen,
  ProvinceTrackingScreen,
  StatsScreen,
} from "./screens";

type ScreenRotatorProps = {
  screens: FlavourScreen[];
  weatherStationResponse: WeatherStation;
  alerts: {
    alerts: CAPObject[];
    mostImportantAlert: CAPObject;
    hasFetched: boolean;
  };
  nationalWeather: NationalWeather;
  provinceTracking: ProvinceTracking;
  season: Season;
  hotColdSpots: HotColdSpots;
};

export function ScreenRotator(props: ScreenRotatorProps) {
  const {
    screens = [],
    weatherStationResponse,
    alerts,
    nationalWeather,
    provinceTracking,
    season,
    hotColdSpots,
  } = props ?? {};

  const [displayedScreenIx, setDisplayedScreenIx] = useState(-1);
  const [conditionsUpdated, setConditionsUpdated] = useState(false);

  let forecastScreenIx = -1;
  const screenRotatorTimeout = useRef<NodeJS.Timeout>(null);

  // basic rotation of screens
  useEffect(() => {
    if (!screens?.length) return;

    // store what index the forecast screen is at
    forecastScreenIx = screens?.findIndex((screen) => screen.id === Screens.FORECAST);

    // displayed screen is set to -1 so we need to start displaying something
    if (displayedScreenIx === -1) setDisplayedScreenIx(0);
    else prepareSwitchToNextScreen();
  }, [displayedScreenIx, screens.length]);

  // used to clear the screen switching timeout
  useEffect(() => {
    return () => {
      screenRotatorTimeout.current && clearTimeout(screenRotatorTimeout.current);
    };
  }, []);

  // handle the conditions updating and needing to do a reload animation
  useEffect(() => {
    screenRotatorTimeout.current && clearTimeout(screenRotatorTimeout.current);

    setConditionsUpdated(true);
    setDisplayedScreenIx(forecastScreenIx);
  }, [weatherStationResponse?.observationID]);

  const prepareSwitchToNextScreen = (): void => {
    // get the data for the screen we want to go to
    const screen = screens[displayedScreenIx];
    if (!screen) return prepareSwitchToNextScreen();

    // if it's not an automatic screen (generally have 0s as duration, we need to switch after its duration time)
    if (!isAutomaticScreen(screen.id)) {
      screenRotatorTimeout.current = setTimeout(() => switchToNextScreen(), screen.duration * 1000);
    } else screenRotatorTimeout.current = null;
  };

  const switchToNextScreen = () => {
    setDisplayedScreenIx((displayedScreenIx + 1) % screens.length);
    if (conditionsUpdated) setConditionsUpdated(false);
  };

  const getComponentForDisplayedScreen = () => {
    const screen = screens[displayedScreenIx];
    if (!screen) return <></>;

    switch (screen.id as Screens) {
      case Screens.ALERTS:
        return <AlertScreen onComplete={switchToNextScreen} {...alerts} />;

      case Screens.FORECAST:
        return (
          <ForecastScreen
            weatherStationResponse={weatherStationResponse}
            alert={alerts?.mostImportantAlert}
            isReload={conditionsUpdated}
            onComplete={switchToNextScreen}
          />
        );

      case Screens.OUTLOOK:
        return <OutlookScreen weatherStationResponse={weatherStationResponse} />;

      case Screens.ALMANAC:
        return <AlmanacScreen weatherStationResponse={weatherStationResponse} />;

      case Screens.PROVINCE_PRECIP:
        return (
          <ProvinceTrackingScreen
            weatherStationTime={weatherStationResponse?.stationTime}
            tracking={provinceTracking}
            onComplete={switchToNextScreen}
          />
        );

      case Screens.CANADA_TEMP_CONDITIONS_MB:
        return (
          <NationalWeatherScreen
            weatherStationTime={weatherStationResponse?.stationTime}
            observations={nationalWeather?.mb}
            onComplete={switchToNextScreen}
          />
        );

      case Screens.CANADA_TEMP_CONDITIONS_WEST:
        return (
          <NationalWeatherScreen
            weatherStationTime={weatherStationResponse?.stationTime}
            observations={nationalWeather?.west}
            onComplete={switchToNextScreen}
          />
        );

      case Screens.CANADA_TEMP_CONDITIONS_EAST:
        return (
          <NationalWeatherScreen
            weatherStationTime={weatherStationResponse?.stationTime}
            observations={nationalWeather?.east}
            onComplete={switchToNextScreen}
          />
        );

      case Screens.STATS:
        return (
          <StatsScreen
            weatherStationTime={weatherStationResponse?.stationTime}
            season={season}
            sunRiseSet={weatherStationResponse?.almanac?.sunRiseSet}
            city={weatherStationResponse?.city}
            hotColdSpots={hotColdSpots}
          />
        );
    }

    return <></>;
  };

  return getComponentForDisplayedScreen();
}
