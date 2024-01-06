import { Request, Response } from "express";
import { safeFlavourName, saveFlavour } from "./utils";
import { Flavour } from "types";
import { FlavourLoader } from "./flavour";

export function putFlavourHandler(req: Request, res: Response) {
  const {
    body: { flavour },
  } = req ?? {};

  try {
    if (!flavour?.name?.length) throw "Flavour doesn't have a name";
    if (!flavour?.screens?.length) throw "Flavour doesn't have any screens";

    saveFlavour(flavour as Flavour, true);
    res.status(200);
    return flavour;
  } catch (e) {
    res.status(500).json({ error: e });
  }
}

export function postFlavourHandler(req: Request, res: Response) {
  const {
    body: { flavour },
  } = req ?? {};

  try {
    if (!flavour?.name?.length) throw "Flavour doesn't have a name";
    if (!flavour?.screens?.length) throw "Flavour doesn't have any screens";

    saveFlavour(flavour as Flavour);
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}

export function getFlavourHandler(req: Request, res: Response) {
  const { flavour: flavourName } = req.params ?? {};

  try {
    const flavour = new FlavourLoader(safeFlavourName(flavourName));
    res.status(200).json({ flavour });
  } catch (e) {
    res.status(500).json({ error: e });
  }
}
