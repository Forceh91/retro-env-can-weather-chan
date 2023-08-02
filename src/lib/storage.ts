import fs from "fs";
import Logger from "./logger";

const logger = new Logger("Storage");

const REQUIRED_DIRECTORIES = ["cfg", "cfg/flavours", "db", "music"];

export function validateDirectories() {
  logger.log("Validating directory structure");

  REQUIRED_DIRECTORIES.forEach((dir) => {
    const requiredDirectoryExists: boolean = fs.existsSync(dir);
    if (requiredDirectoryExists) return;

    logger.warn(`"${dir}" directory doesn\'t exist and will be created`);
    fs.mkdirSync(dir);
  });

  logger.log("Validated directory structure");
}
