const axios = require("axios");
const fs = require("fs");

const { getRadarSeason } = require("./date-utils");
const { parseRadarImage, getRadarImage } = require("./radar-image-parser");

const RADAR_IMAGE_DIRECTORY_URL = "https://dd.weather.gc.ca/radar/DPQPE/GIF/CASWL/"; // hardcoded for woodlands (winnipeg) CASWL
const RADAR_IMAGES_TO_FETCH = 21; // 21 images is last 2 hours from what i understand
const RADAR_IMAGE_FETCH_FREQUENCY = 12 * 60 * 1000; // they seem to update these once every 12mins or so
const SEASON = getRadarSeason();

let radarMap = null;

function loadRadarMap() {
  console.log("[RADAR] Checking for map and loading...");

  // read the map data from the file
  fs.readFile("radar.txt", "utf8", (err, data) => {
    if (err || !data || !data.length) return;

    // store this for later use
    radarMap = data;

    console.log("[RADAR] Stored radar map to memory");
  });
}

function getListOfRadarImages() {
  axios.get(RADAR_IMAGE_DIRECTORY_URL).then((resp) => {
    const { data } = resp;
    if (!data) return;

    // this gives us back a HTML directory so now we need to get all the urls from it that are relevant
    const radarImageURLS = data.match(/.gif">([^>]*?)<\/a>/gi);

    // cleaned image urls
    const cleanedRadarImageUrls = radarImageURLS
      .map((url) => url.replace(/.gif">/gi, "").replace(/<\/a>/gi, ""))
      .filter((url) => url.includes(SEASON));

    // now only get the last x ones
    console.log("[RADAR]", "Fetching last", RADAR_IMAGES_TO_FETCH, "images");
    fetchLatestRadarImages(cleanedRadarImageUrls.slice(-RADAR_IMAGES_TO_FETCH));
  });
}

function fetchLatestRadarImages(radarImageURLs) {
  // make sure url is valid
  if (!radarImageURLs || !radarImageURLs.length) return;

  // fetch and parse them
  radarImageURLs.forEach(async (url, ix) => parseRadarImage(`${RADAR_IMAGE_DIRECTORY_URL}/${url}`, ix));

  console.log("[RADAR]", "Radar images fetched");
}

function initRadarImages(app) {
  setInterval(getListOfRadarImages, RADAR_IMAGE_FETCH_FREQUENCY);

  app.get("/api/radar/map", (req, res) => {
    if (!radarMap || !radarMap.length) return res.sendStatus(404);
    return res.send({ map: radarMap });
  });

  app.get("/api/radar", (req, res) => {
    const images = [];
    for (let i = 0; i < RADAR_IMAGES_TO_FETCH; i++) images.push(getRadarImage(i));

    return res.send({ images, season: getRadarSeason() });
  });

  getListOfRadarImages();
  loadRadarMap();
}

module.exports = {
  initRadarImages,
};
