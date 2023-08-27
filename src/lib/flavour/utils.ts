import { FLAVOUR_DIRECTORY, FLAVOUR_NAME_MAX_LENGTH, SCREENS_WITH_AUTO_DURATION, Screens } from "consts";
import { Flavour } from "types";
import uuid4 from "uuid4";
import fs from "fs";

export function isAutomaticScreen(screenID: Screens) {
  // automatic screens are generally paginated and will handle when it has finished displaying, rather than a set duration
  return SCREENS_WITH_AUTO_DURATION.includes(screenID);
}

export function generateNewFlavour() {
  return {
    name: "",
    created: new Date(),
    modified: new Date(),
    screens: [],
  } as Flavour;
}

export function safeFlavourName(flavourName: string) {
  return flavourName
    .slice(0, FLAVOUR_NAME_MAX_LENGTH)
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
}

export function saveFlavour(flavour: Flavour, isNew: boolean = false) {
  // give it a uuid
  if (isNew) flavour.uuid = uuid4();

  // make flavour name file safe
  const flavourFileName = safeFlavourName(flavour.name);

  // write it to file
  fs.writeFileSync(`${FLAVOUR_DIRECTORY}/${flavourFileName}.json`, JSON.stringify(flavour), "utf8");
}
