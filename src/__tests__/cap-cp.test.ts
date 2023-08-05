import { parseISO } from "date-fns";
import { CAPCPFile } from "lib/cap-cp/cap-cp";
import { CAPSeverity, CAPUrgency } from "types/cap-cp.types";
import thunderstorm_warning from "./testdata/ecccData/cap/thunderstorm_warning";
import thunderstormWarningExpected from "./testdata/ecccData/cap/thunderstorm_warning_expected.json";

describe("CAPCP parsing", () => {
  it("parses a CAP file correctly", () => {
    const alert = new CAPCPFile(
      thunderstorm_warning,
      "https://dd.weather.gc.ca/alerts/cap/20230805/LAND/22/T_ONCN00_C_LAND_202308052237_1211373515.cap"
    );
    expect(alert.identifier).toStrictEqual(thunderstormWarningExpected.identifier);
    expect(alert.sender).toStrictEqual(thunderstormWarningExpected.sender);
    expect(alert.references).toStrictEqual(thunderstormWarningExpected.references);
    expect(alert.effective).toStrictEqual(parseISO(thunderstormWarningExpected.effective));
    expect(alert.expires).toStrictEqual(parseISO(thunderstormWarningExpected.expires));
    expect(alert.headline).toStrictEqual(thunderstormWarningExpected.headline);
    expect(alert.description).toContain(thunderstormWarningExpected.description);
    expect(alert.instruction).toContain(thunderstormWarningExpected.instruction);
    expect(alert.severity).toBe(thunderstormWarningExpected.severity as CAPSeverity);
    expect(alert.urgency).toBe(thunderstormWarningExpected.urgency as CAPUrgency);
    expect(alert.event).toStrictEqual(thunderstormWarningExpected.event);
    expect(alert.certainty).toStrictEqual(thunderstormWarningExpected.certainty);
    expect(alert.audience).toStrictEqual(thunderstormWarningExpected.audience);
    expect(alert.areas[0].polygon).toStrictEqual(thunderstormWarningExpected.areas);
  });

  it("detects that a cap is referencing a polygon correctly", () => {
    const alert = new CAPCPFile(
      thunderstorm_warning,
      "https://dd.weather.gc.ca/alerts/cap/20230805/LAND/22/T_ONCN00_C_LAND_202308052237_1211373515.cap"
    );

    expect(alert.doesCAPReferencePolygon([43.65, -79.38])).toBe(false);
    expect(alert.doesCAPReferencePolygon([49.8681, -91.6834])).toBe(true);
  });

  it("handles an empty cap file", () => {
    const alert = new CAPCPFile(
      "",
      "https://dd.weather.gc.ca/alerts/cap/20230805/LAND/22/T_ONCN00_C_LAND_202308052237_1211373515.cap"
    );
    expect(alert.identifier).toBeFalsy();
    expect(alert.headline).toBeFalsy();
    expect(alert.doesCAPReferencePolygon([43.65, -79.38])).toBe(false);
  });

  it("handles a malformed cap file", () => {
    const alert = new CAPCPFile(
      "<></>",
      "https://dd.weather.gc.ca/alerts/cap/20230805/LAND/22/T_ONCN00_C_LAND_202308052237_1211373515.cap"
    );
    expect(alert.identifier).toBeFalsy();
    expect(alert.headline).toBeFalsy();
    expect(alert.doesCAPReferencePolygon([43.65, -79.38])).toBe(false);
  });

  it("handles a malformed cap file #2", () => {
    const alert = new CAPCPFile(
      `<?xml version='1.0' encoding='UTF-8' standalone='no'?>
        <alert xmlns="urn:oasis:names:tc:emergency:cap:1.2"></alert>`,
      "https://dd.weather.gc.ca/alerts/cap/20230805/LAND/22/T_ONCN00_C_LAND_202308052237_1211373515.cap"
    );
    expect(alert.identifier).toBeFalsy();
    expect(alert.headline).toBeFalsy();
    expect(alert.doesCAPReferencePolygon([43.65, -79.38])).toBe(false);
  });

  it("handles a malformed cap file #3", () => {
    const alert = new CAPCPFile(
      `<?xml version='1.0' encoding='UTF-8' standalone='no'?>
        <notalert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
        <identifier>urn:oid:2.49.0.1.124.1211373515.2023</identifier>
        <sender>cap-pac@canada.ca</sender></notalert>`,
      "https://dd.weather.gc.ca/alerts/cap/20230805/LAND/22/T_ONCN00_C_LAND_202308052237_1211373515.cap"
    );
    expect(alert.identifier).toBeFalsy();
    expect(alert.headline).toBeFalsy();
    expect(alert.doesCAPReferencePolygon([43.65, -79.38])).toBe(false);
  });

  it("handles a malformed cap file #4", () => {
    const alert = new CAPCPFile(
      `<?xml version='1.0' encoding='UTF-8' standalone='no'?>
        <alert xmlns="urn:oasis:names:tc:emergency:cap:1.2"><identifier>urn:oid:2.49.0.1.124.1211373515.2023</identifier></alert>`,
      "https://dd.weather.gc.ca/alerts/cap/20230805/LAND/22/T_ONCN00_C_LAND_202308052237_1211373515.cap"
    );
    expect(alert.identifier).toBeFalsy();
    expect(alert.headline).toBeFalsy();
    expect(alert.doesCAPReferencePolygon([43.65, -79.38])).toBe(false);
  });

  it("handles a malformed cap file #5", () => {
    const alert = new CAPCPFile(
      `<?xml version='1.0' encoding='UTF-8' standalone='no'?><alert xmlns="urn:oasis:names:tc:emergency:cap:1.2"><identifier>urn:oid:2.49.0.1.124.1211373515.2023</identifier><area><areaDesc>Armstrong - Auden - Wabakimi Park</areaDesc></area></alert>`,
      "https://dd.weather.gc.ca/alerts/cap/20230805/LAND/22/T_ONCN00_C_LAND_202308052237_1211373515.cap"
    );
    expect(alert.identifier).toBeFalsy();
    expect(alert.headline).toBeFalsy();
    expect(alert.doesCAPReferencePolygon([43.65, -79.38])).toBe(false);
  });

  it("handles a malformed cap file #6", () => {
    const alert = new CAPCPFile(
      `<?xml version='1.0' encoding='UTF-8' standalone='no'?><alert xmlns="urn:oasis:names:tc:emergency:cap:1.2"><identifier>urn:oid:2.49.0.1.124.1211373515.2023</identifier><area><areaDesc>Armstrong - Auden - Wabakimi Park</areaDesc><polygon></polygon></area></alert>`,
      "https://dd.weather.gc.ca/alerts/cap/20230805/LAND/22/T_ONCN00_C_LAND_202308052237_1211373515.cap"
    );
    expect(alert.identifier).toBeFalsy();
    expect(alert.headline).toBeFalsy();
    expect(alert.doesCAPReferencePolygon([43.65, -79.38])).toBe(false);
  });
});
