const Weather = require("ec-weather-js");
import fs from "fs";
import { EVENT_BUS_CONFIG_CHANGE_PROVINCE_TRACKING, PROVINCE_TRACKING_TEMP_TO_TRACK } from "consts";
import axios from "lib/backendAxios";
import { initializeConfig } from "lib/config";
import Logger from "lib/logger";
import { ProvinceStationTracking, ProvinceStations } from "types";
import { initializeCurrentConditions, initializeHistoricalTempPrecip } from "lib/eccc";
import eventbus from "lib/eventbus";
import { format, subDays } from "date-fns";
import { GetWeatherFileFromECCC } from "lib/eccc/datamart";
import { fetchYesterdayPrecipFromClimateBulk } from "lib/eccc/provinceYesterdayClimatePrecip";

const logger = new Logger("ProvinceTracking");
const PROVINCE_TRACKING_FILE = "db/province_tracking.json";

const conditions = initializeCurrentConditions();
const historicalData = initializeHistoricalTempPrecip();

function normalizeProvinceStationCode(code: string): string {
  return code.replace(/\s/g, "").toUpperCase();
}

function stationFromConfigForCode(stations: ProvinceStations, code: string): ProvinceStations[number] | undefined {
  const key = normalizeProvinceStationCode(code);
  return stations.find((s) => normalizeProvinceStationCode(s.code) === key);
}

/** True when MSC / ec-weather-js carries an explicit trace token (not a numeric zero). */
function fieldExplicitTrace(raw: unknown): boolean {
  if (raw == null) return false;
  if (typeof raw === "string") return /^trace$/i.test(raw.trim());
  if (Array.isArray(raw)) return raw.some((x) => fieldExplicitTrace(x));
  if (typeof raw === "object" && "value" in raw) {
    return fieldExplicitTrace((raw as { value?: unknown }).value);
  }
  return false;
}

/**
 * ec-weather-js `simplify()` turns `<precip>2.4</precip>` into a string; with attributes it stays `{ value, units }`.
 * Reading only `.value` misses the common text-only form and left every station on "MISSING".
 * Literal "Trace" is not returned as amount 0 — use {@link fieldExplicitTrace} + `"TRACE"` in {@link yesterdayPrecipFromCitypage}.
 */
function parseYesterdayPrecipScalar(
  raw: unknown,
  defaultUnits: "mm" | "cm"
): { amount: number; units: "mm" | "cm" } | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    if (!raw.length) return null;
    return parseYesterdayPrecipScalar(raw[raw.length - 1], defaultUnits);
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return { amount: raw, units: defaultUnits };
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (t === "" || /^n\/a$/i.test(t)) return null;
    if (/^nil$/i.test(t)) return { amount: 0, units: defaultUnits };
    if (/^trace$/i.test(t)) return null;
    const n = Number(t);
    return Number.isFinite(n) ? { amount: n, units: defaultUnits } : null;
  }
  if (typeof raw === "object" && raw !== null && "value" in raw) {
    const o = raw as { value?: unknown; units?: string };
    const u = (o.units ?? "").toLowerCase();
    const unitsTag: "mm" | "cm" = u === "cm" ? "cm" : defaultUnits;
    return parseYesterdayPrecipScalar(o.value, unitsTag);
  }
  return null;
}

function yesterdayPrecipFromCitypage(
  yesterdayConditions: unknown
): { amount: number; unit: string } | "TRACE" | null {
  if (yesterdayConditions == null || typeof yesterdayConditions !== "object") return null;
  const yc = yesterdayConditions as Record<string, unknown>;

  const snow = parseYesterdayPrecipScalar(yc.snow, "cm");
  if ((snow?.amount ?? 0) > 0) {
    return { amount: snow.amount, unit: "cm snow" };
  }
  if (fieldExplicitTrace(yc.snow)) {
    return "TRACE";
  }
  if (fieldExplicitTrace(yc.precip)) {
    return "TRACE";
  }

  const liquid = parseYesterdayPrecipScalar(yc.precip, "mm");
  if (liquid != null) {
    return { amount: liquid.amount, unit: liquid.units === "cm" ? "cm snow" : "mm" };
  }

  return null;
}

class ProvinceTracking {
  private _stations: ProvinceStations;
  private _tracking: ProvinceStationTracking[];
  private _displayTemp: string;
  private _tempToTrack: string;
  private _yesterdayPrecipDate: string = "";

  constructor() {
    this.load();
    this.initialize();
    setInterval(() => this.periodicUpdate(), 5 * 60 * 1000);

    eventbus.addListener(EVENT_BUS_CONFIG_CHANGE_PROVINCE_TRACKING, () => this.initialize());
  }

  private initialize() {
    if (!config.provinceHighLowEnabled) {
      logger.log("Province tracking is disabled");
      return;
    }

    this._stations = config.provinceStations ?? [];

    this._tracking = this._tracking
      ? this._tracking.filter(
          (trackingStation) =>
            this._stations.findIndex((station) => trackingStation.station.code === station.code) !== -1
        )
      : [];
    this.rehydrateStationsFromConfig();
    logger.log("Tracking", this._stations?.length || 0, "locations across the province");

    this.periodicUpdate();
  }

  /** Replace each row's `station` with the canonical config object so persisted JSON cannot strip `climateStationId`. */
  private rehydrateStationsFromConfig() {
    if (!this._tracking?.length) return;
    for (let i = 0; i < this._tracking.length; i++) {
      const row = this._tracking[i];
      const canonical = stationFromConfigForCode(this._stations, row.station.code);
      if (canonical) {
        this._tracking[i] = { ...row, station: canonical };
      }
    }
  }

  private periodicUpdate() {
    if (!this._tracking?.length) {
      this._tracking = this._stations.map(
        (provinceStation) =>
          ({
            station: provinceStation,
            minTemp: Math.min(),
            maxTemp: Math.max(),
            displayTemp: null as null,
            yesterdayPrecip: null as null,
            yesterdayPrecipUnit: "mm",
          } as ProvinceStationTracking)
      );
    }

    const displayTemp = this._displayTemp;
    this.setTempScaleToDisplay();
    this.setTempScaleToTrack();

    if (displayTemp !== this._displayTemp) this.resetTracking(!!displayTemp);

    logger.log("Updating data for stations");

    const promises: Promise<void>[] = [];
    this._tracking.forEach((station) => promises.push(this.fetchWeatherForStation(station)));

    Promise.allSettled(promises).then(() => this.save());
  }

  private async fetchWeatherForStation(station: ProvinceStationTracking) {
    const { name, code } = station.station;

    const [province, stationID] = code.split("/");
    const url = await GetWeatherFileFromECCC(province, stationID);
    if (!url) return Promise.reject("URL was invalid.");

    return axios
      .get(url)
      .then(async (resp) => {
        const data = resp && resp.data;
        const weather = new Weather(data);
        if (!weather) throw "Unable to parse weather data";

        const shouldRefreshPrecip =
          station.yesterdayPrecip === null ||
          station.yesterdayPrecip === "MISSING" ||
          this.shouldUpdatePrecipData();

        if (shouldRefreshPrecip) {
          const { yesterdayConditions } = weather.all;

          const isLocalStation =
            normalizeProvinceStationCode(station.station.code) ===
            normalizeProvinceStationCode(`${config.primaryLocation.province}/${config.primaryLocation.location}`);

          const histSnowAmt = isLocalStation ? historicalData.yesterdaySnowData().amount : null;
          const histRainAmt = isLocalStation ? historicalData.yesterdayPrecipData().amount : null;

          const fromHistorical =
            typeof histSnowAmt === "number" && histSnowAmt > 0
              ? { amount: histSnowAmt, unit: "cm snow" as const }
              : typeof histRainAmt === "number"
                ? { amount: histRainAmt, unit: "mm" as const }
                : null;

          const fromApi = yesterdayPrecipFromCitypage(yesterdayConditions);
          const apiTrace = fromApi === "TRACE";

          let resolved: { amount: number; unit: string } | null = fromHistorical;
          if (resolved == null && !apiTrace && typeof fromApi === "object" && fromApi != null) {
            resolved = fromApi;
          }
          if (resolved == null && !apiTrace && yesterdayConditions != null) {
            resolved = { amount: 0, unit: "mm" };
          }

          if (
            resolved == null &&
            !apiTrace &&
            typeof station.station.climateStationId === "number" &&
            Number.isFinite(station.station.climateStationId)
          ) {
            const climateRow = await fetchYesterdayPrecipFromClimateBulk(
              station.station.climateStationId,
              conditions.observedDateTimeAtStation()
            );
            if (climateRow) resolved = climateRow;
          }

          const precipDateLine = () =>
            format(subDays(conditions.observedDateTimeAtStation(), 1), "MMM dd").replace(/\s0/i, "  ");

          if (apiTrace) {
            station.yesterdayPrecip = "TRACE";
            station.yesterdayPrecipUnit = "mm";
            this._yesterdayPrecipDate = precipDateLine();
          } else if (resolved) {
            station.yesterdayPrecip = resolved.amount;
            station.yesterdayPrecipUnit = resolved.unit;
            this._yesterdayPrecipDate = precipDateLine();
          } else {
            station.yesterdayPrecip = "MISSING";
            station.yesterdayPrecipUnit = "mm";
          }
        }

        const temp = weather.current?.temperature?.value;
        if (temp === null || temp === undefined || isNaN(temp)) return;

        const tempAsNumber = Number(temp);
        if (this._tempToTrack === PROVINCE_TRACKING_TEMP_TO_TRACK.MIN_TEMP) {
          if (station.minTemp === null || tempAsNumber < station.minTemp) station.minTemp = tempAsNumber;
        } else if (this._tempToTrack === PROVINCE_TRACKING_TEMP_TO_TRACK.MAX_TEMP) {
          if (station.maxTemp === null || tempAsNumber > station.maxTemp) station.maxTemp = tempAsNumber;
        }
      })
      .catch((err) => logger.error(name, url, "failed to fetch data", err));
  }

  private resetTracking(resetTemps: boolean) {
    logger.log("Switching over tracking and setting display value");

    this._tracking.forEach((station, ix, arr) => {
      if (this._displayTemp === PROVINCE_TRACKING_TEMP_TO_TRACK.MIN_TEMP) {
        arr[ix] = {
          ...arr[ix],
          displayTemp: station.minTemp !== null && station.minTemp !== Math.min() ? station.minTemp : "M",
          maxTemp: resetTemps ? Math.max() : station.maxTemp,
        };
      } else if (this._displayTemp === PROVINCE_TRACKING_TEMP_TO_TRACK.MAX_TEMP) {
        arr[ix] = {
          ...arr[ix],
          displayTemp: station.maxTemp !== null && station.maxTemp !== Math.max() ? station.maxTemp : "M",
          minTemp: resetTemps ? Math.min() : station.minTemp,
        };
      }
    });
  }

  private setTempScaleToTrack() {
    const time = conditions?.observedDateTimeAtStation();
    const hour = time.getHours();

    if (hour >= 20 || hour < 8) this._tempToTrack = PROVINCE_TRACKING_TEMP_TO_TRACK.MIN_TEMP;
    else this._tempToTrack = PROVINCE_TRACKING_TEMP_TO_TRACK.MAX_TEMP;
  }

  private setTempScaleToDisplay() {
    const time = conditions?.observedDateTimeAtStation();
    const hour = time.getHours();

    if (hour >= 20 || hour < 8) this._displayTemp = PROVINCE_TRACKING_TEMP_TO_TRACK.MAX_TEMP;
    else this._displayTemp = PROVINCE_TRACKING_TEMP_TO_TRACK.MIN_TEMP;
  }

  private shouldUpdatePrecipData() {
    const time = conditions?.observedDateTimeAtStation();
    const hour = time.getHours();

    return hour >= 2;
  }

  private load() {
    logger.log("Loading province tracking from", PROVINCE_TRACKING_FILE);
    try {
      const data = fs.readFileSync(PROVINCE_TRACKING_FILE, "utf8");
      if (!data?.length) throw "No data present in json";

      this._tracking = JSON.parse(data);

      logger.log("Loaded province tracking from json");
    } catch (err) {
      if (err.code === "ENOENT") {
        logger.error("No province tracking found");
      } else {
        logger.error("Unable to load from province tracking json");
      }
    }
  }

  private save() {
    logger.log("Storing province tracking");

    fs.writeFile(PROVINCE_TRACKING_FILE, JSON.stringify(this._tracking), "utf8", () => {
      logger.log("Stored province tracking");
    });
  }

  public provinceTracking() {
    return {
      tracking: this._tracking,
      isOvernight: this._displayTemp === PROVINCE_TRACKING_TEMP_TO_TRACK.MIN_TEMP,
      yesterdayPrecipDate: this._yesterdayPrecipDate,
    };
  }
}

const config = initializeConfig();

let provinceTracking: ProvinceTracking = null;
export function initializeProvinceTracking(): ProvinceTracking {
  if (process.env.NODE_ENV === "test") return new ProvinceTracking();
  if (provinceTracking) return provinceTracking;

  provinceTracking = new ProvinceTracking();
  return provinceTracking;
}
