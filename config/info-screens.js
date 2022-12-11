const { isValid, parseISO, compareAsc, startOfToday, endOfDay } = require("date-fns");
const fs = require("fs");

const CONFIG_FOLDER = "./cfg";
const CONFIG_FILE_NAME = "retro-evc-config-info-screens.json";
const CONFIG_FILE = `${CONFIG_FOLDER}/${CONFIG_FILE_NAME}`;

// 8 lines at 32 chars max each
const MAX_MESSAGE_LENGTH = 256;
const INFO_SCREENS = [];

const initInfoScreens = () => {
  // load info screens
  loadInfoScreens();

  // create timer to cleanup (once every 30mins)
  return setInterval(cleanupStaleInfoScreens, 30 * 60 * 1000);
};

const createInfoScreen = (message, start, end, isInfinite) => {
  // make sure the message exists and is short enough
  if (!message || message.length > MAX_MESSAGE_LENGTH) return;

  // make sure we have an end if its not infinite
  if (!isInfinite && !end) return;

  // make sure start/end is valid
  if (!start || !isValid(parseISO(start))) return;
  if (end && !isValid(parseISO(end))) return;

  // make sure start and end are in the future
  const now = startOfToday();
  const isStartInFuture = compareAsc(now, parseISO(start));
  if (isStartInFuture === 1) return;

  const isEndInFuture = compareAsc(now, endOfDay(parseISO(end)));
  if (isEndInFuture === 1) return;

  // create the object to store
  const infoScreen = {
    id: Date.now(),
    message,
    start,
    end,
    isInfinite,
  };

  // save it
  INFO_SCREENS.push(infoScreen);
  saveInfoScreens();

  // return it
  return infoScreen;
};

const loadInfoScreens = () => {
  const failedLoad = () => console.log("[INFO_SCREENS] Failed to load info screens from config...");

  console.log("[INFO_SCREENS] Loading info screens from config...");
  fs.readFile(CONFIG_FILE, "utf8", (err, data) => {
    if (err || !data || !data.length) return failedLoad();

    const parsedJSON = JSON.parse(data);
    if (!parsedJSON) return;

    const { info_screens } = parsedJSON;
    if (!info_screens || !info_screens.length) return failedLoad();

    INFO_SCREENS.push(...info_screens);

    console.log("[INFO_SCREENS] Loaded", INFO_SCREENS.length, "info screens from config!");
  });
};

const saveInfoScreens = (callback) => {
  const doCallback = (resp) => typeof callback === "function" && callback(resp);

  const config = {
    info_screens: INFO_SCREENS,
  };

  console.log("[INFO_SCREENS] Saving info screens to", CONFIG_FILE, "...");
  const configAsJSONString = JSON.stringify(config);

  fs.writeFile(CONFIG_FILE, configAsJSONString, "utf8", (err, data) => {
    if (!err) {
      doCallback(true);
      console.log("[INFO_SCREENS] Info screens saved!");
    } else doCallback(false);
  });
};

const cleanupStaleInfoScreens = () => {
  console.log("[INFO_SCREENS] Cleaning up stale info screens...");
  const now = new Date();
  const ogLength = INFO_SCREENS.length - 1;
  // runs periodically to clean up info screens that have expired
  [...INFO_SCREENS].reverse().forEach((infoScreen, ix) => {
    if (infoScreen.isInfinite) return;

    const parsedEnd = endOfDay(parseISO(infoScreen.end));
    const isEndValid = isValid(parsedEnd);
    if (!isEndValid) return;

    // remove if its old
    if (compareAsc(now, parsedEnd) === 1) INFO_SCREENS.splice(ogLength - ix, 1);
  });

  // save new info screens
  saveInfoScreens();
};

const deleteInfoScreen = (id) => {
  if (!id) return false;

  // all ids will be timestamps
  id = parseInt(id);

  // find its index
  const existingScreenIx = findInfoScreenIx(id);
  if (existingScreenIx === -1) return false;

  // splice it out
  INFO_SCREENS.splice(existingScreenIx, 1);

  // save
  saveInfoScreens();
  return true;
};

const findInfoScreenIx = (id) => {
  return INFO_SCREENS.findIndex((screen) => screen.id === id);
};

const getInfoScreens = () => {
  return INFO_SCREENS;
};

const getActivateInfoScreens = () => {
  const today = startOfToday();
  return INFO_SCREENS.filter((screen) => compareAsc(today, parseISO(screen.start)) !== -1);
};

module.exports = {
  initInfoScreens,
  createInfoScreen,
  loadInfoScreens,
  saveInfoScreens,
  deleteInfoScreen,
  cleanupStaleInfoScreens,
  getInfoScreens,
  getActivateInfoScreens,
};
