import fs from "fs";
import Logger from "./logger";

const logger = new Logger("Storage");

export function validateDirectories() {
  logger.log("Validating directory structure");

  const dbFolderExists: boolean = fs.existsSync("db");
  if (!dbFolderExists) {
    logger.warn('"db" directory doesn\'t exist and will be created');
    fs.mkdirSync("db");
  }

  logger.log("Validated directory structure");
}
