import React from "react";
import ReactDOM from "react-dom/client";

function WeatherChannel() {
  return (
    <>
      <div id="crawler_bar"></div>
      <div id="display"></div>
      <div id="footer_bar"></div>
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
