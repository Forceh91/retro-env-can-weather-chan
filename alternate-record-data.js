/*
format for the json file would be as follows
{
  "records": [
    { 
      "hi": {
        "value": 4.4,
        "year": 1880
      },
      "lo": {
        "value": -43.3,
        "year": 1885
      }
    },
    ]
}

where each entry in "records" is the day of the year (1-366)
*/

const axios = require("axios");
const { misc } = require("./config/config");

const alternateRecords = [];

const fetchAlternateRecordData = async () => {
  const { alternateRecordsSource } = misc();
  if (!alternateRecordsSource) return;

  await axios
    .get(alternateRecordsSource)
    .then((resp) => {
      const { data } = resp;
      if (!data || !data.records || !data.records.length) return;

      alternateRecords.push(...data.records);
      console.log("[ALTERNATE RECORDS]", "Alternate record data received");
    })
    .catch(() => console.log("[ALTERNATE RECORDS]", "Unable to retrieve alternate record data"));
};

const getRecordDataForDayOfYear = (dayOfYear) => {
  if (!alternateRecords || !alternateRecords.length || dayOfYear < 1 || dayOfYear > 366) return null;
  return alternateRecords[dayOfYear - 1];
};

module.exports = { fetchAlternateRecordData, getRecordDataForDayOfYear };
