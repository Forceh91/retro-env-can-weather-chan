import express from "express";
import { getSeasonData } from "lib/season";

/*
 * "/" here represets "/season"
 */

const router = express.Router();
router.get("/", getSeasonData);

export default router;
