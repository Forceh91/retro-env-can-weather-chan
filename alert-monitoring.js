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

  setInterval(periodicCleanup, 15 * 1000 * 60);
}

function pushAlertToList(alert) {
  const { identifier, references, expires } = alert;

  // this is a pretty wild guess, BUT, from what i understand, the references lists any
  // identifiers that this is updating or in relation too, so with that, if the references
  // includes an identifier, we should remove that alert because it's stale
  const ix = alertsFromCAP.findIndex((a) => references.includes(a.identifier));
  if (ix !== -1) alertsFromCAP.splice(ix, 1, alert);
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
