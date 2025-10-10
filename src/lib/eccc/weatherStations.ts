import axios from "lib/backendAxios";
import { ECCCWeatherStation } from "types";
import { ElementCompact, xml2js } from "xml-js";

/*
  name: station.nameEn._text,
  province: station.provinceCode._text,
  code: station._attributes.code,
*/

export async function getECCCWeatherStations(searchTerm: string) {
  const stations = [];
  const { data } = await axios.get("https://dd.weather.gc.ca/today/citypage_weather/siteList.xml");
  const parsedData: ElementCompact = xml2js(data, { compact: true });
  if (!parsedData || !parsedData["siteList"] || !parsedData["siteList"]["site"]) {
    throw "Unable to parse weather stations";
  }

  // now we have the actual site list we can parsed out the stations relevant to the search term
  const sites: ElementCompact = parsedData["siteList"]["site"];
  if (!sites) throw "No weather stations available";

  // if there's only one entry it returns it as just an object, so handle that
  let siteList;
  if (!sites?.length) siteList = [sites];
  else siteList = sites;

  // first we'll clean it up to useful data
  const cleanSiteList = siteList.map((station: ElementCompact) => ({
    name: station.nameEn?._text ?? "",
    province: station.provinceCode?._text ?? "",
    location: station._attributes?.code ?? "",
  }));

  // then filter the result
  stations.push(
    ...cleanSiteList.filter((station: ECCCWeatherStation) =>
      station.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return stations;
}
