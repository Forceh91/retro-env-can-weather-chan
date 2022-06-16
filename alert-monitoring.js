const { listen } = require("./sarra-canada-amqp");
const { fetchCapFileAndParse } = require("./cap-file-parser");
const { compareAsc, parseISO } = require("date-fns");

const alertsFromCAP = [];

function startAlertMonitoring(city) {
  console.log("[ALERT MONITORING] Starting alert monitoring via AMQP...");

  listen({ amqp_subtopic: "alerts.cap.#" })
    .on("error", (err) => console.warn(err.message))
    .on("message", (date, url) => {
      console.log("[ALERT MONITORING]", date, url);
      fetchCapFileAndParse(url, city, (alert) => {
        pushAlertToList(alert);
      });
    });

  fetchCapFileAndParse(
    "https://dd4.weather.gc.ca/alerts/cap/20220615/LAND/23/T_ONCN00_C_LAND_202206152302_0707244343.cap",
    city,
    (alert) => {
      pushAlertToList(alert);
    }
  );

  //   setTimeout(periodicCleanup, 15 * 1000 * 60);
  setTimeout(periodicCleanup, 10 * 1000);
}

function pushAlertToList(alert) {
  const { identifier, expires } = alert;
  const ix = alertsFromCAP.findIndex((a) => a.identifier === identifier);
  if (ix !== -1) alertsFromCAP.splice(ix, 1);
  else alertsFromCAP.push(alert);

  console.log(
    `[ALERT MONITORING] Ingested CAP (${identifier}), expiry set for ${expires}`,
    `(total: ${alertsFromCAP.length})`
  );
}

function periodicCleanup() {
  if (!alertsFromCAP || !alertsFromCAP.length) return;
  console.log("[ALERT MONITORING] Running periodic cleanup...");

  // loop backwards through the alerts and remove any that are expired
  alertsFromCAP.reverse().forEach((alert, ix) => {
    const { identifier, expires } = alert;
    const utcDate = parseISO(new Date().toISOString());
    const expiresDate = parseISO(expires);

    // utc date is past the expiry so it needs removing
    if (compareAsc(utcDate, expiresDate) === 1) {
      alertsFromCAP.splice(ix, 1);
      console.log(`[ALERT MONITORING] Removing expired CAP (${identifier}`);
    }
  });

  console.log("[ALERT MONITORING] Periodic cleanup completed");
}

function getAlertsFromCAP() {
  return alertsFromCAP;
}

module.exports = { startAlertMonitoring, getAlertsFromCAP };
