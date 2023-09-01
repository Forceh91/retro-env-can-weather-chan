import express from "express";
import { getAirQuality, postStationsHandler } from "lib/airquality/routeHandler";

/*
 * "/" here represents "/airquality"
 */

const router = express.Router();
router.get("/", getAirQuality);
router.post("/stations", postStationsHandler);

export default router;
