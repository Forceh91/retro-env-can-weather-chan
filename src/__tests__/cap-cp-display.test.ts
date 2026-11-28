import {
  shouldAlertFlash,
  cleanupAlertHeadline,
  isWarningSevereThunderstormWatch,
  normalizeAlertHeadline,
} from "lib/cap-cp/cap-cp-display";
import { CAPObject, CAPSeverity, CAPUrgency } from "types/cap-cp.types";

const baseCAPObject = {
  identifier: null,
  sender: null,
  sent: null,
  references: null,
  effective: null,
  expires: null,
  headline: null,
  description: null,
  instruction: null,
  severity: CAPSeverity.UNKNOWN,
  urgency: CAPUrgency.UNKNOWN,
  areas: null,
  event: null,
  certainty: null,
  audience: null,
} as CAPObject;

describe("alert display helpers", () => {
  it("recognizes what alerts should flash their headline", () => {
    expect(shouldAlertFlash(null)).toBe(false);
    expect(shouldAlertFlash(baseCAPObject)).toBe(false);
    expect(shouldAlertFlash({ ...baseCAPObject, severity: CAPSeverity.UNKNOWN })).toBe(false);
    expect(shouldAlertFlash({ ...baseCAPObject, severity: CAPSeverity.MINOR })).toBe(false);
    expect(shouldAlertFlash({ ...baseCAPObject, severity: CAPSeverity.MODERATE })).toBe(true);
    expect(shouldAlertFlash({ ...baseCAPObject, severity: CAPSeverity.SEVERE })).toBe(true);
    expect(shouldAlertFlash({ ...baseCAPObject, severity: CAPSeverity.EXTREME })).toBe(true);
    expect(
      shouldAlertFlash({ ...baseCAPObject, severity: CAPSeverity.MODERATE, headline: "air quality statement" })
    ).toBe(false);
    expect(
      shouldAlertFlash({ ...baseCAPObject, severity: CAPSeverity.MODERATE, headline: "special weather advisory" })
    ).toBe(false);
  });

  it("removes 'in effect' from the alert headline properly", () => {
    expect(cleanupAlertHeadline(null)).toBe("");
    expect(cleanupAlertHeadline("weather alert in effect")).toBe("weather alert");
    expect(cleanupAlertHeadline("weather alert ended")).toBe("weather alert ended");
    expect(cleanupAlertHeadline("special weather statement in effect")).toBe("special weather statement");
  });

  it("converts colour-coded headlines back to the simulator-era format", () => {
    expect(normalizeAlertHeadline(null)).toBe("");
    expect(normalizeAlertHeadline("snowfall warning in effect")).toBe("snowfall warning in effect");
    expect(normalizeAlertHeadline("yellow warning - snowfall - in effect")).toBe("snowfall warning in effect");
    expect(normalizeAlertHeadline("Orange Advisory - Freezing-rain - In Effect")).toBe("Freezing-rain Advisory In Effect");
    expect(normalizeAlertHeadline("red warning - tornado - ended")).toBe("tornado warning ended");
    expect(normalizeAlertHeadline("yellow watch - severe thunderstorm - in effect")).toBe(
      "severe thunderstorm watch in effect"
    );
    expect(cleanupAlertHeadline("yellow warning - snowfall - in effect")).toBe("snowfall warning");
    expect(cleanupAlertHeadline("red warning - tornado - ended")).toBe("tornado warning ended");
  });

  it("detect that a severe thunderstorm watch is in effect correctly", () => {
    expect(isWarningSevereThunderstormWatch(null)).toBe(false);
    expect(isWarningSevereThunderstormWatch("weather alert in effect")).toBe(false);
    expect(isWarningSevereThunderstormWatch("weather alert ended")).toBe(false);
    expect(isWarningSevereThunderstormWatch("special weather statement in effect")).toBe(false);
    expect(isWarningSevereThunderstormWatch("severe thunderstorm warning in effect")).toBe(false);
    expect(isWarningSevereThunderstormWatch("tornada watch in effect")).toBe(false);
    expect(isWarningSevereThunderstormWatch("severe thunderstorm watch in effect")).toBe(true);
    expect(isWarningSevereThunderstormWatch("yellow watch - severe thunderstorm - in effect")).toBe(true);
    expect(isWarningSevereThunderstormWatch("yellow warning - severe thunderstorm - in effect")).toBe(false);
  });
});
