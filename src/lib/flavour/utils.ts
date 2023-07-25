import { SCREENS_WITH_AUTO_DURATION, Screens } from "consts";

export function isAutomaticScreen(screenID: Screens) {
  // automatic screens are generally paginated and will handle when it has finished displaying, rather than a set duration
  return SCREENS_WITH_AUTO_DURATION.includes(screenID);
}
