const { isValid, parseISO, compareAsc, startOfToday } = require("date-fns");
const fs = require("fs");

const CONFIG_FOLDER = "./cfg";
const CONFIG_FILE_NAME = "retro-evc-config-info-screens.json";
const CONFIG_FILE = `${CONFIG_FOLDER}/${CONFIG_FILE_NAME}`;

// 8 lines at 32 chars max each
const MAX_MESSAGE_LENGTH = 256;
const INFO_SCREENS = [];

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

  const isEndInFuture = compareAsc(now, parseISO(end + "T23:59:59.0Z"));
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

const getInfoScreens = () => {
  return INFO_SCREENS;
};

module.exports = { createInfoScreen, saveInfoScreens, getInfoScreens };
