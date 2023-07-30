import express from "express";
import {
  getObserved,
  getForecast,
  getAlmanac,
  getSeasons,
  getAlerts,
  getLive,
  getNational,
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
router.get("/regional", getNational);

export default router;
