import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";

import { API_PORT, CORS_OPTIONS } from "consts";
import { initializeRouter } from "routes";

export function initializeAPI(): void {
  // setup express first with cors, json, and listening port
  const api = express().use(cors(CORS_OPTIONS)).use(express.json());
  api.listen(API_PORT);

  // now we can setup the router
  const router = initializeRouter();
  api.use("/api/v1", router);

  // and the static folders of dist, music, etc.
  api.use(express.static("dist"));
  api.get("/", (req: Request, res: Response) => res.sendFile("dist/index.html", { root: "." }));
}
