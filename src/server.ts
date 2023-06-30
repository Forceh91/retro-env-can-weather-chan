import { initializeAPI } from "api";
import { initializeConfig } from "lib";
import Logger from "lib/logger";

const logger = new Logger("Server");

logger.log("Starting RWC...");
initializeAPI();
initializeConfig();
logger.log("Started RWC");
