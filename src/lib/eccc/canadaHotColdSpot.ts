import { initializeConfig } from "lib/config";
import Logger from "lib/logger";
import { ECCCHotColdSpotElement, HotColdSpot } from "types";
import axios from "axios";
import { ElementCompact, xml2js } from "xml-js";

const logger = new Logger("Canada_Hot_Cold_Spots");
const config = initializeConfig();

// fetch this once every 6 hours
const FETCH_CANADA_HOT_COLD_SPOT_INTERVAL = 60 * 1000 * 60 * 6;

class CanadaProvincialHotColdSpots {
  private _apiURL: string;
  private _hotColdSpots = {
    hotSpot: { name: null, temperature: null, province: null } as HotColdSpot,
    coldSpot: { name: null, temperature: null, province: null } as HotColdSpot,
  };
  private _lastUpdated: Date;

  constructor() {
    this.fetchCanadaProvincialHotColdSpot();
    setInterval(() => this.fetchCanadaProvincialHotColdSpot(), FETCH_CANADA_HOT_COLD_SPOT_INTERVAL);
  }

  private fetchCanadaProvincialHotColdSpot() {
    const province = config?.primaryLocation?.province;
    if (!province) return;

    const currentDate = new Date();
    const date = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, "0")}${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}`;

    this._apiURL = `https://dd.weather.gc.ca/observations/xml/${province.toUpperCase()}/today/today_${province.toLowerCase()}_${date}_e.xml`;

    logger.log("Updating canada/provincial hot/cold spots");
    axios
      .get(this._apiURL)
      .then((resp) => {
        const data = resp.data;
        if (!data) return;

        // convert to js object
        const provinceTodayData: ElementCompact = xml2js(data, { compact: true });
        if (!provinceTodayData) return;

        // check it has hot/cold spot data (this is all we want here)
        const collection = provinceTodayData["om:ObservationCollection"];
        if (!collection) return;

        const hotColdSpotParent = collection["om:member"][0];
        if (!hotColdSpotParent) return;

        const hotColdSpotData = hotColdSpotParent["om:Observation"]["om:result"];
        if (!hotColdSpotData) return;

        // this presumes that the first element for `hot/cold_spot_location_canada` is the best for the day
        const hotSpotLocationCanada: ECCCHotColdSpotElement = hotColdSpotData.elements.element.find(
          (e: ECCCHotColdSpotElement) => e._attributes.name === "hot_spot_location_canada"
        );

        // pull out the values for the temp and province
        const [hotLocationTempValueObj, hotLocationProvinceValueObj] = hotSpotLocationCanada.qualifier;

        // put all of this data together
        const hotLocationName = hotSpotLocationCanada._attributes.value ?? "";
        const hotLocationTempValue = hotLocationTempValueObj?._attributes?.value ?? "";
        const hotLocationProvinceValue = hotLocationProvinceValueObj?._attributes?.uom ?? "";

        // store for later use
        this._hotColdSpots.hotSpot = {
          name: hotLocationName,
          temperature: Number(hotLocationTempValue),
          province: hotLocationProvinceValue,
        };

        // this presumes that the first element for `hot/cold_spot_location_canada` is the best for the day
        const coldSpotLocationCanada: ECCCHotColdSpotElement = hotColdSpotData.elements.element.find(
          (e: ECCCHotColdSpotElement) => e._attributes.name === "cold_spot_location_canada"
        );

        // pull out the values for the temp and province
        const [coldLocationTempValueObj, coldLocationProvinceValueObj] = coldSpotLocationCanada.qualifier;

        // put all of this data together
        const coldLocationName = coldSpotLocationCanada._attributes.value ?? "";
        const coldLocationTempValue = coldLocationTempValueObj?._attributes?.value ?? "";
        const coldLocationProvinceValue = coldLocationProvinceValueObj?._attributes?.uom ?? "";

        // store for later use
        this._hotColdSpots.coldSpot = {
          name: coldLocationName,
          temperature: Number(coldLocationTempValue),
          province: coldLocationProvinceValue,
        };

        // last updated
        this._lastUpdated = new Date();
      })
      .catch(() => logger.error("Unable to fetch canada/provincial hot/cold spots"));
  }
}

let canadaProvincialHotColdSpots: CanadaProvincialHotColdSpots = null;
export function initializeCanadaProvincialHotColdSpot() {
  if (canadaProvincialHotColdSpots) return canadaProvincialHotColdSpots;

  canadaProvincialHotColdSpots = new CanadaProvincialHotColdSpots();
  return canadaProvincialHotColdSpots;
}
