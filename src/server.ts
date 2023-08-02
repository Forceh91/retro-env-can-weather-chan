import { initializeAPI } from "api";
import { validateDirectories } from "lib";
import { initializeConfig } from "lib/config";
import { initializeCanadaProvincialHotColdSpot, initializeCurrentConditions } from "lib/eccc";
import { initializeAlertMonitor } from "lib/eccc/alertMonitor";
import Logger from "lib/logger";
import { initializeNationalWeather } from "lib/national";
import { initializeProvinceTracking } from "lib/provincetracking";
import { initializeSunspots } from "lib/sunspots";
import { initializeUSAWeather } from "lib/usaweather";

const logger = new Logger("Server");

logger.log("Starting RWC...");
validateDirectories();
initializeConfig();
initializeCurrentConditions();
initializeAlertMonitor();
initializeNationalWeather();
initializeProvinceTracking();
initializeCanadaProvincialHotColdSpot();
initializeUSAWeather();
initializeSunspots();
initializeAPI();
logger.log("Started RWC");
