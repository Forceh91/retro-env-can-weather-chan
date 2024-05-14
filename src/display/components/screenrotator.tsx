import { useEffect, useRef, useState } from "react";
import { DEFAULT_WEATHER_STATION_ID, SCREEN_BACKGROUND_BLUE, SCREEN_BACKGROUND_RED, Screens } from "consts";
import { isAutomaticScreen } from "lib/flavour/utils";
import {
  AQHIObservationResponse,
  CAPObject,
  FlavourScreen,
  HotColdSpots,
  LastMonth,
  NationalWeather,
  ProvinceTracking,
  Season,
  SunspotStationObservations,
  USAStationObservations,
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
  LastMonthScreen,
  SunspotScreen,
  WindchillEffectScreen,
  AQHIWarningScreen,
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
  lastMonth: LastMonth;
  usaWeather: USAStationObservations;
  sunspots: SunspotStationObservations;
  airQuality: AQHIObservationResponse;
  configVersion: string;
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
    lastMonth,
    usaWeather,
    sunspots,
    airQuality,
    configVersion,
  } = props ?? {};

  const [displayedScreenIx, setDisplayedScreenIx] = useState(-1);
  const [conditionsOrConfigUpdated, setConditionsOrConfigUpdated] = useState(false);
  const [backgroundColour, setBackgroundColour] = useState(SCREEN_BACKGROUND_BLUE);

  let forecastScreenIx = -1;
  const screenRotatorTimeout = useRef<NodeJS.Timeout>(null);
  const backgroundRotatorTimeout = useRef<NodeJS.Timeout>(null);

  // basic rotation of screens
  useEffect(() => {
    if (!screens?.length) return;

    // store what index the forecast screen is at
    forecastScreenIx = screens?.findIndex((screen) => screen.id === Screens.FORECAST);

    // displayed screen is set to -1 so we need to start displaying something
    if (displayedScreenIx === -1) setDisplayedScreenIx(0);
    else prepareSwitchToNextScreen();
  }, [displayedScreenIx, screens.length, configVersion]);

  // used to clear the screen switching timeout
  useEffect(() => {
    return () => {
      screenRotatorTimeout.current && clearTimeout(screenRotatorTimeout.current);
      backgroundRotatorTimeout.current && clearTimeout(backgroundRotatorTimeout.current);
    };
  }, []);

  // handle the conditions updating and needing to do a reload animation
  useEffect(() => {
    screenRotatorTimeout.current && clearTimeout(screenRotatorTimeout.current);

    setConditionsOrConfigUpdated(true);
    setDisplayedScreenIx(forecastScreenIx !== -1 ? forecastScreenIx : 0);
    setBackgroundColour(SCREEN_BACKGROUND_BLUE);
  }, [weatherStationResponse?.observationID, configVersion]);

  const switchBackgroundColour = () => {
    // if we have a timer don't do anything
    if (backgroundRotatorTimeout.current) return;

    // create 20ms timer to switch background
    backgroundRotatorTimeout.current = setTimeout(() => {
      // alternate between blue/red
      if (backgroundColour !== SCREEN_BACKGROUND_BLUE) setBackgroundColour(SCREEN_BACKGROUND_BLUE);
      else setBackgroundColour(SCREEN_BACKGROUND_RED);

      // clear the existing timer we knew about
      backgroundRotatorTimeout.current = null;
    }, 20);
  };

  const prepareSwitchToNextScreen = (): void => {
    // clear the timeout if a timed screen got skipped due to lack of content
    screenRotatorTimeout.current && clearTimeout(screenRotatorTimeout.current);

    // get the data for the screen we want to go to
    const screen = screens[displayedScreenIx];
    if (!screen) return prepareSwitchToNextScreen();

    // if it's not an automatic screen (generally have 0s as duration, we need to switch after its duration time)
    if (!isAutomaticScreen(screen.id)) {
      screenRotatorTimeout.current = setTimeout(() => switchToNextScreen(), screen.duration * 1000);
    } else screenRotatorTimeout.current = null;

    // 20ms after index changes, switch the background colour. should be enough time for screens that
    // decide if they show or not to complete that action
    if (!conditionsOrConfigUpdated) switchBackgroundColour();
  };

  const switchToNextScreen = () => {
    setDisplayedScreenIx((displayedScreenIx + 1) % screens.length);
    if (conditionsOrConfigUpdated) setConditionsOrConfigUpdated(false);
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
            isReload={conditionsOrConfigUpdated}
            airQuality={airQuality}
            onComplete={switchToNextScreen}
          />
        );

      case Screens.OUTLOOK:
        return <OutlookScreen weatherStationResponse={weatherStationResponse} />;

      case Screens.ALMANAC:
        return <AlmanacScreen weatherStationResponse={weatherStationResponse} airQuality={airQuality} />;

      case Screens.AQHI_WARNING:
        return (
          <AQHIWarningScreen
            city={
              weatherStationResponse?.stationID === DEFAULT_WEATHER_STATION_ID ? "WPG" : weatherStationResponse?.city
            }
            airQuality={airQuality}
            onComplete={switchToNextScreen}
          />
        );

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
            area="MB"
            onComplete={switchToNextScreen}
          />
        );

      case Screens.CANADA_TEMP_CONDITIONS_WEST:
        return (
          <NationalWeatherScreen
            weatherStationTime={weatherStationResponse?.stationTime}
            observations={nationalWeather?.west}
            area="WEST"
            onComplete={switchToNextScreen}
          />
        );

      case Screens.CANADA_TEMP_CONDITIONS_EAST:
        return (
          <NationalWeatherScreen
            weatherStationTime={weatherStationResponse?.stationTime}
            observations={nationalWeather?.east}
            area="EAST"
            onComplete={switchToNextScreen}
          />
        );

      case Screens.USA_TEMP_CONDITIONS:
        // yeah i know it uses national weather screen but its literally the same display
        return (
          <NationalWeatherScreen
            weatherStationTime={weatherStationResponse?.stationTime}
            observations={usaWeather}
            area="USA"
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

      case Screens.LAST_MONTH_STATS:
        return (
          <LastMonthScreen city={weatherStationResponse?.city} lastMonth={lastMonth} onComplete={switchToNextScreen} />
        );

      case Screens.SUNSPOTS:
        return (
          <SunspotScreen
            sunspots={sunspots}
            weatherStationTime={weatherStationResponse?.stationTime}
            onComplete={switchToNextScreen}
          />
        );

      case Screens.WINDCHILL:
        return <WindchillEffectScreen onComplete={switchToNextScreen} />;
    }

    return <></>;
  };

  return (
    <div id="display" style={{ backgroundColor: backgroundColour }}>
      {getComponentForDisplayedScreen()}
    </div>
  );
}
