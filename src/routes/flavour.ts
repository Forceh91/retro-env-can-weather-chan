import express from "express";
import { putFlavourHandler, postFlavourHandler, getFlavourHandler } from "lib/flavour";

/*
 * "/" here represents "/flavour"
 */

const router = express.Router();
router.put("/", putFlavourHandler);
router.post("/", postFlavourHandler);
router.get("/:flavour", getFlavourHandler);

export default router;
