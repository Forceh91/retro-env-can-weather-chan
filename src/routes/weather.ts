import express from "express";
import {
  getObserved,
  getForecast,
  getAlmanac,
  getSeasons,
  getAlerts,
  getLive,
  getNational,
  getProvinceTracking,
  getHoldColdSpots,
  getUSA,
  getSunspots,
} from "lib/eccc/routeHandler";

/*
 * "/" here represents "/weather"
 */

const router = express.Router();
router.get("/observed", getObserved);
router.get("/forecast", getForecast);
router.get("/almanac", getAlmanac);
router.get("/seasons", getSeasons);
router.get("/alerts", getAlerts);
router.get("/live", getLive);
router.get("/national", getNational);
router.get("/usa", getUSA);
router.get("/sunspots", getSunspots);
router.get("/province", getProvinceTracking);
router.get("/hotColdSpots", getHoldColdSpots);

export default router;
