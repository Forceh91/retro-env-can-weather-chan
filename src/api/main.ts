import express, { Request, Response } from "express";
import cors from "cors";

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
  api.use(express.static("music"));
  api.get("/", (req: Request, res: Response) => res.sendFile("dist/index.html", { root: "." }));
  api.get("/config", (req: Request, res: Response) => res.sendFile("dist/config.html", { root: "." }));
  api.get("/music/*", (req: Request, res: Response) => {
    res.sendFile(`./music/${decodeURI(req.url).split("music/")[1]}`, { root: "." });
  });
}
