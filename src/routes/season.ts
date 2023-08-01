import express from "express";
import { getLastMonthSummary, getSeasonData } from "lib/season";

/*
 * "/" here represets "/season"
 */

const router = express.Router();
router.get("/", getSeasonData);
router.get("/lastMonth", getLastMonthSummary);

export default router;
