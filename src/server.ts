import { initializeAPI } from "api";
import { validateDirectories } from "lib";
import { initializeConfig } from "lib/config";
import { initializeCurrentConditions } from "lib/eccc";
import Logger from "lib/logger";

const logger = new Logger("Server");

logger.log("Starting RWC...");
validateDirectories();
initializeAPI();
initializeConfig();
initializeCurrentConditions();
logger.log("Started RWC");
