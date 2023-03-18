const { listen } = require("./sarra-canada-amqp");

const startCurrentConditionMonitoring = (province, locationCode, callback) => {
  console.log("[CONDITIONS AMQP] Starting conditions monitoring via AMQP...");
  listen({ amqp_subtopic: `citypage_weather.xml.${province}.#` })
    .on("error", (err) => console.warn(err.message))
    .on("message", (date, url) => {
      if (!url.includes(`${locationCode}_e.xml`)) return;

      console.log("[CONDITIONS AMQP] Update received at", date);
      typeof callback === "function" && callback(url);
    });
};

module.exports = { startCurrentConditionMonitoring };
