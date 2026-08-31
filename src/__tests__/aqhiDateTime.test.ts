import { aqhiHourTo24 } from "lib/airquality/aqhiDateTime";

describe("aqhiHourTo24", () => {
  it("maps 12h noon and midnight correctly", () => {
    expect(aqhiHourTo24(12, true, true)).toBe(12);
    expect(aqhiHourTo24(12, false, true)).toBe(0);
    expect(aqhiHourTo24(1, false, true)).toBe(1);
    expect(aqhiHourTo24(11, true, true)).toBe(23);
  });

  it("passes through 24h clock values", () => {
    expect(aqhiHourTo24(0, true, false)).toBe(0);
    expect(aqhiHourTo24(12, false, false)).toBe(12);
    expect(aqhiHourTo24(23, false, false)).toBe(23);
  });
});
