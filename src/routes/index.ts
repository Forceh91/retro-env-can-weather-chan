import express, { Router } from "express";
import initRoutes from "./init";
import weatherRoutes from "./weather";
import configRoutes from "./config";
import seasonRoutes from "./season";
import flavourRoutes from "./flavour";
import airQualityRoutes from "./airQuality";

export function initializeRouter(): Router {
  const router = express.Router();
  router.use("/init", initRoutes);
  router.use("/weather", weatherRoutes);
  router.use("/config", configRoutes);
  router.use("/season", seasonRoutes);
  router.use("/flavour", flavourRoutes);
  router.use("/airquality", airQualityRoutes);

  return router;
}
