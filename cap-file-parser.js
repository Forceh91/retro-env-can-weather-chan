const xmljs = require("xml-js");
const axios = require("axios");

function fetchCapFileAndParse(url, city, callback) {
  if (!url || !city) return;
  city = city.toLowerCase();

  console.log(`[CAP PARSER] Retrieving CAP (${url}) and checking relevance...`);

  // url for a cap file has been given to us, so now we need to see if it's relevant to us
  axios.get(url).then((resp) => {
    const data = resp.data;
    if (!data) return;

    // convert to js object
    const weatherAlertCAP = xmljs.xml2js(data, { compact: true });
    if (!weatherAlertCAP) return;

    // find the alert->info->area and see if any include the city we're tracking
    // we're presuming info[0] for the english version
    const alert = weatherAlertCAP.alert;
    const info_en = alert?.info.find((i) => i.language?._text === "en-CA");
    let areas = info_en?.area || [];

    if (!Array.isArray(areas)) areas = [areas];

    // loop through areas and see if our tracked city is included
    let isRelevant = false;
    areas.some((area) => {
      const areaDesc = (area.areaDesc?._text || "").toLowerCase();
      const regexString = `\\b${city}\\b`;
      const regexMatch = new RegExp(regexString, "gmi");
      const regexResult = areaDesc.match(regexMatch);
      isRelevant = regexResult && regexResult[0] === city;
      if (isRelevant) return true;
    });

    // if its not relevant stop, otherwise get the data
    if (!isRelevant) return console.log(`[CAP PARSER] CAP (${url}) is not relevant, discarding`);
    else console.log(`[CAP PARSER] CAP (${url}) is relevant, parsing alerts...`);

    // check we have the required information here
    const identifier = alert?.identifier?._text;
    if (!identifier) return;

    const references = alert?.references?._text || "";

    const expires = info_en?.expires?._text;
    if (!expires) return;

    const headline = info_en?.headline?._text;
    if (!headline) return;

    const description = info_en?.description?._text;
    if (!description) return;

    const severity = info_en?.severity?._text;
    if (!severity) return;

    const urgency = info_en?.urgency?._text;
    if (!urgency) return;

    console.log(`[CAP PARSER] CAP ${url} has been parsed, passing along to alert monitor`);

    if (typeof callback === "function")
      callback({ identifier, references, expires, headline, description, severity, urgency, url });
  });
}

module.exports = { fetchCapFileAndParse };
