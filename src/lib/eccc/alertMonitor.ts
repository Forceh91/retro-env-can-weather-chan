import fs from "fs";
import { initializeCurrentConditions } from "./conditions";
import { listen } from "lib/amqp";
import { Connection } from "types/amqp.types";
import Logger from "lib/logger";
import { CAPCPFile } from "lib/cap-cp";
import axios from "lib/backendAxios";
import { FS_NO_FILE_FOUND } from "consts";
import { compareAsc, parseISO } from "date-fns";

const logger = new Logger("Alert_Monitor");
const conditions = initializeCurrentConditions();

const ALERTS_FILE = "db/alerts.txt";

class AlertMonitor {
  private _amqpConnection: Connection;
  private _alerts: CAPCPFile[] = [];

  constructor() {
    this.startAMQPConnection();
    this.loadStoredCAPFiles();
    this.periodicCleanupCAPFiles();

    // cleanup stale alerts every 15 minutes
    setInterval(() => this.periodicCleanupCAPFiles(), 15 * 1000 * 60);
  }

  private startAMQPConnection() {
    if (this._amqpConnection) this._amqpConnection.disconnect();

    // hook up the amqp listener
    const { connection, emitter: listener } = listen({
      amqp_subtopic: `*.WXO-DD.alerts.cap.#`,
    });

    // handle errors and messages
    listener
      .on("error", (...error) => logger.error("AMQP error:", error))
      .on("message", (date: string, url: string) => {
        logger.log("AMQP pushed CAP file", url, "at", date);
        this.parseCAPFile(url);
      });

    // store the connection so we can disconnect if needed
    this._amqpConnection = connection;

    logger.log("Started AMQP alerts listener");
  }

  private parseCAPFile(url: string, skipRelevancyCheck: boolean = false) {
    axios
      .get(url)
      .then((resp) => {
        const { data } = resp;
        if (!data) return;

        // parse the cap file
        const cap = new CAPCPFile(data, url);
        if (!cap) return;

        // check if its relevant
        if (!skipRelevancyCheck) {
          const weatherStationPolygon = [conditions.stationLatLong.lat, conditions.stationLatLong.long];
          logger.log("Checking if CAP file is relevant to this weather station located at", weatherStationPolygon);
          if (!cap.doesCAPReferencePolygon(weatherStationPolygon)) return;
        }

        logger.log("CAP file is relevant, expires at", cap.expires);

        // if it is, push it to the list and remove any alerts that were referenced by this one
        this.storeCAPFileToMemory(cap);
      })
      .catch((err) => logger.error("Unable to fetch/parse CAP file", url, err));
  }

  private storeCAPFileToMemory(cap: CAPCPFile) {
    if (!cap) return;

    // if this new cap file references another cap file, we should remove the older cap file
    const ix = this._alerts.findIndex((storedAlert: CAPCPFile) => cap.references.includes(storedAlert.identifier));
    if (ix !== -1) this._alerts.splice(ix, 1);

    // push the new cap file to the list
    this._alerts.push(cap);
    logger.log(`Ingested CAP (${cap.identifier}) which will expire at`, cap.expires, `(total: ${this._alerts.length})`);

    // store the alerts for later
    this.saveCAPFiles();
  }

  private loadStoredCAPFiles() {
    logger.log("Loading stored CAP files");

    // attempt to read "db/alerts.txt" and load any found urls
    try {
      const data = fs.readFileSync(ALERTS_FILE, "utf8");
      if (!data?.length) return;

      // alerts are stored as one url per line
      const urls = data.split("\n");
      urls.forEach((url: string) => this.parseCAPFile(url.trim(), true));
    } catch (err) {
      if (err.code === FS_NO_FILE_FOUND) {
        logger.error("No CAP files in storage");
      } else {
        logger.error("Unable to load stored CAP files", err);
      }
    }
  }

  private saveCAPFiles() {
    logger.log("Storing CAP files");

    const capFileURLS = this._alerts.map((cap: CAPCPFile) => cap.url);
    fs.writeFile(ALERTS_FILE, capFileURLS.join("\n"), "utf8", () => {
      logger.log("CAP files stored");
    });
  }

  private periodicCleanupCAPFiles() {
    if (!this._alerts?.length) return;

    logger.log("Running periodic cleanup");

    // remove any alerts that have expired from memory, but go backwards through the array
    this._alerts.reverse().forEach((alert: CAPCPFile, ix: number) => {
      if (compareAsc(parseISO(new Date().toISOString()), alert.expires) !== 1) return;

      this._alerts.splice(ix, 1);
      logger.log("Removed expired CAP", alert.identifier);
    });

    // resave the list of urls
    this.saveCAPFiles();
  }

  private sortAlerts() {
    if (!this._alerts?.length) return;

    return this._alerts.sort((a, b) => {
      // sort by severity
      if (a.severity > b.severity) return -1;
      if (b.severity > a.severity) return 1;

      // then by urgency
      if (a.urgency > b.urgency) return -1;
      if (b.urgency > a.urgency) return 1;

      // then by date
      if (a.sent > b.sent) return -1;
      if (b.sent > a.sent) return 1;

      // both the same
      return 0;
    });
  }

  public alerts() {
    // sort the alerts and then clean the response payload up because we dont need everything
    const sortedAlerts = this.sortAlerts()?.map((alert) => ({
      url: alert.url,
      identifier: alert.identifier,
      sent: alert.sent?.toISOString(),
      expires: alert.expires?.toISOString(),
      headline: alert.headline,
      description: alert.description,
      severity: alert.severity,
      urgency: alert.urgency,
    }));

    return {
      alerts: sortedAlerts ?? [],
    };
  }
}

let alertMonitor: AlertMonitor = null;
export function initializeAlertMonitor(forceNewInstance: boolean = false): AlertMonitor {
  if (!forceNewInstance && alertMonitor) return alertMonitor;

  alertMonitor = new AlertMonitor();
  return alertMonitor;
}
