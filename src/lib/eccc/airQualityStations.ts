import axios from "lib/backendAxios";
import { AirQualityStations } from "types";
import { ElementCompact, xml2js } from "xml-js";

/*
  name: station.nameEn._text,
  province: station.provinceCode._text,
  code: station._attributes.code,
*/

export async function getECCCAirQualityStations(searchTerm: string) {
  const stations: AirQualityStations = [];
  const { data } = await axios.get("https://dd.weather.gc.ca/today/air_quality/doc/AQHI_XML_File_List.xml");
  const parsedData: ElementCompact = xml2js(data, { compact: true });
  if (!parsedData || !parsedData["dataFile"] || !parsedData["dataFile"]["EC_administrativeZone"]) {
    throw "Unable to parse air quality stations";
  }

  // now we have the actual admin zones we can parsed out the stations relevant to the search term
  const administrativeZones: ElementCompact = parsedData["dataFile"]["EC_administrativeZone"];
  if (!administrativeZones) throw "No admin zones available";

  // handle just one entry
  let zoneList = administrativeZones;
  if (!Array.isArray(administrativeZones) || !zoneList?.length) zoneList = [zoneList];

  // first we'll clean it up to useful data
  zoneList.forEach((zone: ElementCompact) => {
    const regionList: ElementCompact = zone["regionList"];
    if (!regionList) return;

    // handle just one entry
    let regions = regionList["region"];
    if (!Array.isArray(regions) || !regions?.length) regions = [regions];

    // loop through and take note of all of these
    regions.forEach((region: ElementCompact) => {
      stations.push({
        zone: zone._attributes.abreviation?.toString(),
        code: region._attributes.cgndb?.toString(),
        name: region._attributes.nameEn?.toString(),
      });
    });
  });

  return stations.filter((station) => station.name.toLowerCase().includes(searchTerm.toLowerCase()));
}
