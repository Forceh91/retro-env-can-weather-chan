const xmljs = require("xml-js");
const axios = require("axios");

let latestAQHIReading = null;

function initAQHIObservation(city) {
  fetchAQHIObservationRegions(city);
  setInterval(() => fetchAQHIObservationRegions(city), 10 * 60 * 1000);
}

function fetchAQHIObservationRegions(city) {
  clearAQHIObservation();

  // the first thing we need to do is fetch the list of regions and see if our city is in there
  const aqhiRegionsURL = `https://dd.weather.gc.ca/air_quality/doc/AQHI_XML_File_List.xml`;
  axios
    .get(aqhiRegionsURL)
    .then((resp) => {
      const data = resp.data;
      if (!data) return;

      // convert xml to js object
      const regionList = xmljs.xml2js(data, { compact: true });
      if (!regionList) return;

      // get all of the zones that are monitored
      const zones = regionList.dataFile?.EC_administrativeZone;
      if (!zones || !zones.length) return;

      // loop through all of them and see if our city is in here
      let relevantAQHIFile = false;
      zones.some((zone) => {
        zone.regionList?.region.some((region) => {
          if (region._attributes?.nameEn === city) relevantAQHIFile = region.pathToCurrentObservation?._text || false;
          return relevantAQHIFile !== false;
        });

        return relevantAQHIFile;
      });

      // unfortunately our city isn't in this list
      if (!relevantAQHIFile) return;

      // if we did find it then go find what the latest observation was
      fetchLatestAQHIObservation(relevantAQHIFile);
    })
    .catch(() => {
      console.log("[AQHI]", "Regions list failed to download.");
    });
}

function fetchLatestAQHIObservation(observationURL) {
  clearAQHIObservation();

  if (!observationURL || !observationURL.length) return;

  axios
    .get(observationURL)
    .then((resp) => {
      const data = resp.data;
      if (!data) return;

      // convert xml to js object
      const aqhiObservation = xmljs.xml2js(data, { compact: true });
      if (!aqhiObservation) return;

      const conditionAirQuality = aqhiObservation.conditionAirQuality;
      if (!conditionAirQuality) return;

      const hourObserved = conditionAirQuality.dateStamp?.hour;
      let observedTime = "";
      if (hourObserved) observedTime = `${parseInt(hourObserved?._text)} ${hourObserved?._attributes?.ampm}`;

      const dayObserved = conditionAirQuality.dateStamp?.day;
      let observedDate = "";
      if (dayObserved) observedDate = dayObserved?._text;

      const monthObserved = conditionAirQuality.dateStamp?.month;
      let observedMonth = "";
      if (monthObserved) observedMonth = monthObserved?._attributes?.nameEn;

      // get the actual reading
      const aqhi = parseFloat(conditionAirQuality.airQualityHealthIndex?._text || -1);
      if (aqhi === -1) return;

      // now group this into the good/bad/fair/whatever rankings
      storeAQHIObservation(aqhi, observedDate, observedMonth, observedTime);
    })
    .catch(() => {
      console.log("[AQHI]", "Failed to fetch AQHI for observed city");
    });
}

function clearAQHIObservation() {
  latestAQHIReading = null;
}

function storeAQHIObservation(aqhi, day, month, hour) {
  latestAQHIReading = {
    summary: getTextSummaryOfAQHI(aqhi),
    aqhi,
    day,
    month,
    hour,
    needsWarning: doesAQHINeedWarning(aqhi),
  };
}

function getTextSummaryOfAQHI(aqhi) {
  if (aqhi > 10) return "Bad";
  if (aqhi >= 7) return "Poor";
  if (aqhi >= 4) return "Fair";
  else return "Good";
}

function doesAQHINeedWarning(aqhi) {
  return aqhi >= 4;
}

function getAQHIObservation() {
  return latestAQHIReading;
}

module.exports = { initAQHIObservation, getAQHIObservation };
