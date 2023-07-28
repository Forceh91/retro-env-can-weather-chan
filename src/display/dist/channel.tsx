import { FooterBar } from "display/components/footerbar";
import { ScreenRotator } from "display/components/screenrotator";
import { useAlerts } from "hooks";
import { useConfig } from "hooks/init";
import { useWeatherEventStream } from "hooks/weather";
import React from "react";
import ReactDOM from "react-dom/client";

function WeatherChannel() {
  const { config } = useConfig();
  const { currentConditions } = useWeatherEventStream();
  const alertsHook = useAlerts();

  return (
    <>
      <div id="crawler_bar"></div>
      <div id="display">
        <ScreenRotator
          screens={config?.flavour?.screens}
          weatherStationResponse={currentConditions}
          alerts={alertsHook}
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
