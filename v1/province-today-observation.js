const xmljs = require("xml-js");
const axios = require("axios");

const PROVINCE_OBSERVATION_DATA_URL = `https://dd.weather.gc.ca/observations/xml/$PROVINCE_UPPER/today/today_$PROVINCE_$YEAR$MONTH$DAY_e.xml`;

let hotColdSpotsCanada = {};

function fetchProvinceObservationData(province) {
  const provinceUpper = (province || "").toUpperCase();
  const provinceLower = (province || "").toLowerCase();

  // fill in the province data
  let url = PROVINCE_OBSERVATION_DATA_URL.replace("$PROVINCE_UPPER", provinceUpper).replace("$PROVINCE", provinceLower);

  // and the date (month is 0 indexed in JS)
  const today = new Date();
  const date = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  url = url
    .replace("$YEAR", year)
    .replace("$MONTH", month < 10 ? `0${month}` : month)
    .replace("$DAY", date < 10 ? `0${date}` : date);

  // now we can fetch the result
  axios
    .get(url)
    .then((resp) => {
      const data = resp.data;
      if (!data) return;

      // convert to js object
      const provinceTodayData = xmljs.xml2js(data, { compact: true });
      if (!provinceTodayData) return;

      // check it has hot/cold spot data (this is all we want here)
      const collection = provinceTodayData["om:ObservationCollection"];
      if (!collection) return;

      const hotColdSpotParent = collection["om:member"][0];
      if (!hotColdSpotParent) return;

      const hotColdSpotData = hotColdSpotParent["om:Observation"]["om:result"];
      if (!hotColdSpotData) return;

      // this presumes that the first element for `hot/spot_location_canada` is the best for the day
      const hotSpotLocationCanada = hotColdSpotData.elements.element.find(
        (e) => e._attributes.name === "hot_spot_location_canada"
      );

      // pull out the values for the temp and province
      const [hotLocationTempValueObj, hotLocationProvinceValueObj] = hotSpotLocationCanada.qualifier;

      // put all of this data together
      const hotLocationName = hotSpotLocationCanada._attributes.value || "";
      const hotLocationTempValue = hotLocationTempValueObj?._attributes?.value || "";
      const hotLocationProvinceValue = hotLocationProvinceValueObj?._attributes?.uom || "";

      // now add it into our stored data
      hotColdSpotsCanada.hot = {
        city: hotLocationName,
        province: hotLocationProvinceValue,
        temp: hotLocationTempValue,
      };

      // this presumes that the first element for `hot/spot_location_canada` is the best for the day
      const coldSpotLocationCanada = hotColdSpotData.elements.element.find(
        (e) => e._attributes.name === "cold_spot_location_canada"
      );

      // pull out the values for the temp and province
      const [coldLocationTempValueObj, coldLocationProvinceValueObj] = coldSpotLocationCanada.qualifier;

      // put all of this data together
      const coldLocationName = coldSpotLocationCanada._attributes.value || "";
      const coldLocationTempValue = coldLocationTempValueObj?._attributes?.value || "";
      const coldLocationProvinceValue = coldLocationProvinceValueObj?._attributes?.uom || "";

      // now add it into our stored data
      hotColdSpotsCanada.cold = {
        city: coldLocationName,
        province: coldLocationProvinceValue,
        temp: coldLocationTempValue,
      };
    })
    .catch((e) => {
      console.log("e", e);
      console.warn("[PROVINCE TODAY]", "Failed to fetch province today for province", province);
    });
}

function getHotColdSpotsCanada() {
  return hotColdSpotsCanada || {};
}

module.exports = { fetchProvinceObservationData, getHotColdSpotsCanada };
