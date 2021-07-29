const Weather = require("ec-weather-js");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const corsOptions = {
  origin: "http://localhost:8080",
  optionsSuccessStatus: 200,
};
const app = express().use(cors(corsOptions));
const port = 8600;

app.get("/api/weather", async (req, res) => {
  axios.get("https://dd.weather.gc.ca/citypage_weather/xml/ON/s0000458_e.xml").then((resp) => {
    const weather = new Weather(resp.data);
    if (!weather) return;
    res.send({
      location: weather.all.location,
      current: weather.current,
      riseSet: weather.all.riseSet,
      observed: weather.date,
    });
  });
});

app.listen(port);
