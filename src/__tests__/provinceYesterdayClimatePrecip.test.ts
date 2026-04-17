import moxios from "moxios";
import axios from "lib/backendAxios";
import { fetchYesterdayPrecipFromClimateBulk } from "lib/eccc/provinceYesterdayClimatePrecip";

const header = `<?xml version="1.0" encoding="utf-8"?><climatedata xmlns:xsd="http://www.w3.org/XMLSchema-instance">
<stationinformation><name>TEST</name><province_or_territory>ON</province_or_territory></stationinformation>`;

function wrapStation(body: string): string {
  return `${header}${body}</climatedata>`;
}

describe("provinceYesterdayClimatePrecip", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("parses liquid precip for the calendar day before observed date", async () => {
    const observed = new Date(2023, 7, 7, 12, 0, 0);
    const xml = wrapStation(
      `<stationdata day="6" month="8" year="2023"><totalprecipitation>3.3</totalprecipitation><totalsnow>0.0</totalsnow></stationdata>`
    );

    const p = fetchYesterdayPrecipFromClimateBulk(900001, observed);

    await moxios.wait(() => {
      const req = moxios.requests.mostRecent();
      expect(req.url).toContain("stationID=900001");
      expect(req.url).toContain("Year=2023");
      expect(req.url).toContain("Month=8");
      req.respondWith({ status: 200, response: xml });
    });

    await expect(p).resolves.toEqual({ amount: 3.3, unit: "mm" });
  });

  it("prefers snow over rain when snow total is positive", async () => {
    const observed = new Date(2023, 7, 8, 12, 0, 0);
    const xml = wrapStation(
      `<stationdata day="7" month="8" year="2023"><totalprecipitation>2.0</totalprecipitation><totalsnow>4.0</totalsnow></stationdata>`
    );

    const p = fetchYesterdayPrecipFromClimateBulk(900002, observed);

    await moxios.wait(() => {
      moxios.requests.mostRecent().respondWith({ status: 200, response: xml });
    });

    await expect(p).resolves.toEqual({ amount: 4, unit: "cm snow" });
  });
});
