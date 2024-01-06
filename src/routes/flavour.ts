import express from "express";
import { initializeConfig } from "lib/config";
import { putFlavourHandler, postFlavourHandler, getFlavourHandler, safeFlavourName } from "lib/flavour";

/*
 * "/" here represents "/flavour"
 */

const config = initializeConfig();
const router = express.Router();
router.put("/", (req, res) => {
  const createdFlavour = putFlavourHandler(req, res);
  // for some reason this is circular if i do this in route handler?
  config.regenerateAvailableFlavours();
  // dont wait for regenrate to finish, just presume this flavour we put is the only new one
  res.json({ flavour: createdFlavour, flavours: [...config.flavours, safeFlavourName(createdFlavour.name)] });
});
router.post("/", postFlavourHandler);
router.get("/:flavour", getFlavourHandler);

export default router;
