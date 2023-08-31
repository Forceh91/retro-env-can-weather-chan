import express from "express";
import { getAirQuality } from "lib/airquality/routeHandler";

/*
 * "/" here represents "/airquality"
 */

const router = express.Router();
router.get("/", getAirQuality);

export default router;
