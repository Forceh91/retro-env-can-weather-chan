import { initializeAPI } from "api";
import { validateDirectories } from "lib";
import { initializeConfig } from "lib/config";
import { initializeCurrentConditions } from "lib/eccc";
import { initializeAlertMonitor } from "lib/eccc/alertMonitor";
import Logger from "lib/logger";
import { initializeRegionalWeather } from "lib/regional";

const logger = new Logger("Server");

logger.log("Starting RWC...");
validateDirectories();
initializeAPI();
initializeConfig();
initializeCurrentConditions();
initializeAlertMonitor();
initializeRegionalWeather();
logger.log("Started RWC");
