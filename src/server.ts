import { initializeAPI } from "api";
import Logger from "lib/logger";

const logger = new Logger("Server");

logger.log("Starting RWC...");
initializeAPI();
logger.log("Started RWC");
