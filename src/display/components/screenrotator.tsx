import { useEffect, useState } from "react";
import { Screens } from "consts";
import { isAutomaticScreen } from "lib/flavour/utils";
import { FlavourScreen, WeatherStation } from "types";
import { AlmanacScreen, ForecastScreen } from "./screens";

type ScreenRotatorProps = {
  screens: FlavourScreen[];
  weatherStationResponse: WeatherStation;
};

export function ScreenRotator(props: ScreenRotatorProps) {
  const { screens = [], weatherStationResponse } = props ?? {};

  const [displayedScreenIx, setDisplayedScreenIx] = useState(-1);

  useEffect(() => {
    if (!screens?.length) return;

    // displayed screen is set to -1 so we need to start displaying something
    if (displayedScreenIx === -1) setDisplayedScreenIx(0);
    else prepareSwitchToNextScreen();
  }, [displayedScreenIx, screens.length]);

  const prepareSwitchToNextScreen = (): void => {
    // get the data for the screen we want to go to
    const screen = screens[displayedScreenIx];
    if (!screen) return prepareSwitchToNextScreen();

    // if it's not an automatic screen (generally have 0s as duration, we need to switch after its duration time)
    if (!isAutomaticScreen(screen.id)) {
      setTimeout(() => switchToNextScreen(), screen.duration * 1000);
    }
  };

  const switchToNextScreen = () => {
    setDisplayedScreenIx((displayedScreenIx + 1) % screens.length);
  };

  const getComponentForDisplayedScreen = () => {
    const screen = screens[displayedScreenIx];
    if (!screen) return <></>;

    switch (screen.id as Screens) {
      case Screens.FORECAST:
        return <ForecastScreen weatherStationResponse={weatherStationResponse} onComplete={switchToNextScreen} />;

      case Screens.ALMANAC:
        return <AlmanacScreen />;
    }

    return <></>;
  };

  return getComponentForDisplayedScreen();
}
