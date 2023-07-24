import { Request, Response } from "express";
import { initializeConfig } from "./config";

const config = initializeConfig();

export function getConfigHandler(req: Request, res: Response) {
  res.json({ config: config.config, crawler: config.crawlerMessages });
}

export function getInitHandler(req: Request, res: Response) {
  res.json({
    config: { font: config.lookAndFeel.font, provinceHighLowEnabled: config.provinceHighLowEnabled },
    crawler: config.crawlerMessages,
    flavour: config.flavour,
  });
}
