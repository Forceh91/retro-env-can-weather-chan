import { initializeAPI } from "api";
import { initializeConfig } from "lib/config";
import { initializeCurrentConditions } from "lib/eccc";
import Logger from "lib/logger";

const logger = new Logger("Server");

logger.log("Starting RWC...");
initializeAPI();
initializeConfig();
initializeCurrentConditions();
logger.log("Started RWC");
