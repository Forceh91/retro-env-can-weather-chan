import fs from "fs";
import { FLAVOUR_DEFAULT, FLAVOUR_DIRECTORY, FS_NO_FILE_FOUND, SCREEN_MIN_DISPLAY_LENGTH, Screens } from "consts";
import { parseISO } from "date-fns";
import Logger from "lib/logger";
import { FlavourScreen } from "types";

const logger = new Logger("Flavour_Loader");

export class FlavourLoader {
  public name: string;
  public created: Date;
  public modified: Date;
  public screens: FlavourScreen[];

  constructor(flavourName: string) {
    this.loadFlavour(flavourName);
  }

  private loadFlavour(flavourName: string) {
    // flavour name didn't exist or was default, load the default flavour
    if (!flavourName?.length || flavourName.toLowerCase() === "default") return this.loadDefaultFlavour();

    // otherwise parse the JSON file and its contents
    try {
      const flavour = fs.readFileSync(`${FLAVOUR_DIRECTORY}/${flavourName}.json`, "utf8");

      // parse the json from the config file
      const parsedFlavour = JSON.parse(flavour);
      if (!parsedFlavour) throw "Bad flavour data";

      // get the info from the file and parse relevant stuff
      const { name, created, modified, screens } = parsedFlavour;
      this.name = name;
      this.created = parseISO(created);
      this.modified = parseISO(modified);

      // make sure the screens entries are valid
      this.screens = screens
        .filter((screen: FlavourScreen) => this.isScreenConfigValid(screen))
        .map((screen: FlavourScreen) => ({
          ...screen,
          duration: screen.duration ? Math.max(Number(screen.duration), SCREEN_MIN_DISPLAY_LENGTH) : 0,
        }));

      if (!this.screens?.length) throw "No valid screens on flavour";
      else logger.log("Successfully loaded flavour", this.name);
    } catch (err) {
      if (err.code === FS_NO_FILE_FOUND) logger.error("Flavour not found, loading default");
      else logger.error("Corrupted flavour:", err, "... loading default");

      this.loadDefaultFlavour();
    }
  }

  private loadDefaultFlavour() {
    logger.log("Loading default flavour");

    this.name = FLAVOUR_DEFAULT.name;
    this.created = parseISO(FLAVOUR_DEFAULT.created);
    this.modified = parseISO(FLAVOUR_DEFAULT.modified);
    this.screens = FLAVOUR_DEFAULT.screens;
    logger.log("Loaded flavour", this.name);
  }

  private isScreenConfigValid(screen: FlavourScreen) {
    return (
      !isNaN(screen.id) &&
      typeof screen.duration !== "string" &&
      screen.id >= Screens.ALERTS &&
      screen.id <= Screens.WINDCHILL
    );
  }
}
