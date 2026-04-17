import { parseAlmanacExtremesFromCitypageXml } from "lib/eccc/almanacExtremesFromCitypageXml";

describe("parseAlmanacExtremesFromCitypageXml", () => {
  it("parses extreme max/min and years from raw citypage almanac XML", () => {
    const xml = `
   <almanac>
      <temperature class="extremeMax" period="1938-2012" unitType="metric" units="C" year="1944">35.0</temperature>
      <temperature class="extremeMin" period="1938-2012" unitType="metric" units="C" year="1951">-7.2</temperature>
   </almanac>`;
    const r = parseAlmanacExtremesFromCitypageXml(xml);
    expect(r.extremeMax).toEqual({ value: 35, unit: "C", year: 1944 });
    expect(r.extremeMin).toEqual({ value: -7.2, unit: "C", year: 1951 });
  });

  it("matches class case-insensitively", () => {
    const xml = `<temperature class="EXTREMEMAX" year="2001">12.3</temperature>`;
    const r = parseAlmanacExtremesFromCitypageXml(xml);
    expect(r.extremeMax).toEqual({ value: 12.3, unit: "C", year: 2001 });
    expect(r.extremeMin).toBeNull();
  });

  it("returns value without year when year attribute is absent", () => {
    const xml = `<temperature class="extremeMax" units="C">22.0</temperature>`;
    const r = parseAlmanacExtremesFromCitypageXml(xml);
    expect(r.extremeMax).toEqual({ value: 22, unit: "C" });
  });

  it("finds extremes when other attributes precede class", () => {
    const xml = `<temperature period="1938-2012" class="extremeMax" units="C" year="1999">31.4</temperature>`;
    const r = parseAlmanacExtremesFromCitypageXml(xml);
    expect(r.extremeMax).toEqual({ value: 31.4, unit: "C", year: 1999 });
  });

  it("returns nulls for empty or missing almanac", () => {
    expect(parseAlmanacExtremesFromCitypageXml("")).toEqual({ extremeMax: null, extremeMin: null });
  });
});
