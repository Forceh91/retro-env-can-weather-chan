import { FooterBar } from "display/components/footerbar";
import { useConfig } from "hooks/init";
import React from "react";
import ReactDOM from "react-dom/client";

function WeatherChannel() {
  const { config } = useConfig();

  return (
    <>
      <div id="crawler_bar"></div>
      <div id="display"></div>
      <FooterBar />
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
