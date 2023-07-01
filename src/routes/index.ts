import express, { Router } from "express";
import initRoutes from "./init";
import weatherRoutes from "./weather";
import configRoutes from "./config";

export function initializeRouter(): Router {
  const router = express.Router();
  router.use("/init", initRoutes);
  router.use("/weather", weatherRoutes);
  router.use("/config", configRoutes);

  return router;
}
