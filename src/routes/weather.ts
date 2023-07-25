import express from "express";
import { getObserved, getForecast, getAlmanac, getSeasons, getAlerts, getLive } from "lib/eccc/routeHandler";

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

export default router;
