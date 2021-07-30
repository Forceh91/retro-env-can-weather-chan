const cliSelect = require("cli-select");
const axios = require("axios");
const { xml2js } = require("xml-js");

let pages = 0;

console.log("Fetching available locations...");
axios
  .get("https://dd.weather.gc.ca/citypage_weather/xml/siteList.xml")
  .then((resp) => {
    const data = resp.data;
    if (!data) return;

    const options = xml2js(data, { compact: true });
    if (!options || !options.siteList || !options.siteList.site) throw "Unable to parse siteList";

    const sortedByLocationProvince = options.siteList.site.sort((a, b) => {
      const provinceLocationA = `${a?.provinceCode._text} - ${a?.nameEn._text}`.toUpperCase();
      const provinceLocationB = `${b?.provinceCode._text} - ${b?.nameEn._text}`.toUpperCase();

      if (provinceLocationA < provinceLocationB) return -1;
      if (provinceLocationA > provinceLocationB) return 1;

      return 0;
    });

    renderCityOptions(sortedByLocationProvince);
  })
  .catch((err) => {
    console.log(err);
    console.error("Unable to retrieve list of weather locations");
  });

const MAX_CITIES_PER_PAGE = 10;
function renderCityOptions(options, page) {
  page = page || 1;
  pages = Math.ceil(options.length / MAX_CITIES_PER_PAGE);

  const startIndex = Math.max(0, (page - 1) * MAX_CITIES_PER_PAGE - 1);
  const endIndex = Math.min(startIndex + MAX_CITIES_PER_PAGE - 1, options?.length);

  console.log("Select location to pull weather data from:", options);
  cliSelect({
    values: [...options.slice(startIndex, endIndex), { isPrev: true }, { isNext: true }],
    valueRenderer: (value, selected) => {
      if (value.isPrev) return "Prev Page";
      if (value.isNext) return "Next Page";
      return `${value?.nameEn._text} - ${value?.provinceCode._text}`;
    },
    indentation: 2,
  }).then((resp) => {
    if (resp.value.isPrev) renderCityOptions(options, page - 1);
    else if (resp.value.isNext) renderCityOptions(options, page + 1);
    else {
      // generate object to save
      const locationToPullFrom = {
        province: resp.value.provinceCode._text,
        location: resp._attributes.code,
      };

      // save it
      console.log(`${value?.nameEn._text} - ${value?.provinceCode._text} as primary location`);
    }
  });
}
