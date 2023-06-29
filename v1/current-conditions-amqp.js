const { listen } = require("./sarra-canada-amqp");

const startCurrentConditionMonitoring = (province, locationCode, callback) => {
  console.log("[CONDITIONS AMQP] Starting conditions monitoring via AMQP...");

  const { connection, emitter: listener } = listen({ amqp_subtopic: `citypage_weather.xml.${province}.#` });

  listener
    .on("error", (err) => console.warn(err.message))
    .on("message", (date, url) => {
      if (!url.includes(`${locationCode}_e.xml`)) return;

      console.log("[CONDITIONS AMQP] Update received at", date);
      typeof callback === "function" && callback(url);
    });

  return connection;
};

module.exports = { startCurrentConditionMonitoring };
