import axios from "lib/backendAxios";
import { GetWeatherFileFromECCC } from "lib/eccc/datamart";

jest.mock("lib/backendAxios");

describe("GetWeatherFileFromECCC", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns null without making a request when the station ID is missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(await GetWeatherFileFromECCC("MB", undefined as any)).toBeNull();
    expect(await GetWeatherFileFromECCC("MB", "")).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("returns null without making a request when the province is missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(await GetWeatherFileFromECCC(undefined as any, "s0000193")).toBeNull();
    expect(await GetWeatherFileFromECCC("", "s0000193")).toBeNull();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("finds the latest file for a valid station", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: [
        'href="20260101T000000.000Z_MSC_CitypageWeather_s0000193_en.xml"',
        'href="20260101T010000.000Z_MSC_CitypageWeather_s0000193_en.xml"',
      ].join("\n"),
    });

    const url = await GetWeatherFileFromECCC("MB", "s0000193");
    expect(url).toMatch(/20260101T010000\.000Z_MSC_CitypageWeather_s0000193_en\.xml$/);
  });
});
