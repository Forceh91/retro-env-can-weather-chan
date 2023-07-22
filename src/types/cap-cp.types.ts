export type CAPObject = {
  identifier: string;
  sender: string;
  sent: Date;
  references: string;
  effective: Date;
  expires: Date;
  headline: string;
  description: string;
  instruction: string;
  severity: CAPSeverity;
  urgency: CAPUrgency;
  areas: CAPArea[];
  event: string;
  certainty: string;
  audience: string;
};

export type CAPArea = {
  polygon: number[][];
  description: string;
};

export type CAPAreaRaw = {
  areaDesc: { _text: string };
  polygon: { _text: string };
};

export enum CAPSeverity {
  UNKNOWN,
  MINOR,
  MODERATE,
  SEVERE,
  EXTREME,
}

export enum CAPUrgency {
  UNKNOWN,
  PAST,
  FUTURE,
  EXPECTECD,
  IMMEDIATE,
}
