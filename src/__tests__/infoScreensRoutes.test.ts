const mockConfig = {
  infoScreens: [] as any[],
  activeInfoScreens: [{ id: "active", message: "SHOWING" }],
  lookAndFeel: { font: "vt323" },
  provinceHighLowEnabled: true,
  configVersion: "v1",
  crawlerMessages: [] as string[],
  flavour: { name: "default", screens: [] as any[] },
  musicPlaylist: [] as string[],
  setInfoScreens: jest.fn((entries: any[]) => {
    mockConfig.infoScreens = entries;
  }),
};

jest.mock("lib/config/config", () => ({ initializeConfig: () => mockConfig }));

import { getInitHandler, postInfoScreens } from "lib/config/routeHandler";

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("info screens routes", () => {
  beforeEach(() => {
    mockConfig.infoScreens = [];
    mockConfig.setInfoScreens.mockClear();
  });

  it("only sends the active info screens to the display", () => {
    const res = mockResponse();
    getInitHandler({} as any, res);
    expect(res.json.mock.calls[0][0].infoScreens).toStrictEqual(mockConfig.activeInfoScreens);
  });

  it("saves valid info screens and sends them back with their ids", () => {
    const res = mockResponse();
    postInfoScreens({ body: { infoScreens: [{ message: "HAPPY HOLIDAYS  ", start: "2026-12-01" }] } } as any, res);

    expect(mockConfig.setInfoScreens).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    const [{ infoScreens }] = res.json.mock.calls[0];
    expect(infoScreens).toHaveLength(1);
    expect(infoScreens[0]).toMatchObject({ message: "HAPPY HOLIDAYS", start: "2026-12-01" });
    expect(infoScreens[0].id).toEqual(expect.any(String));
  });

  it("can save an empty list (to delete them all)", () => {
    const res = mockResponse();
    postInfoScreens({ body: { infoScreens: [] } } as any, res);
    expect(mockConfig.setInfoScreens).toHaveBeenCalledWith([]);
    expect(res.json).toHaveBeenCalledWith({ infoScreens: [] });
  });

  it("refuses all of them, saving nothing, if any don't fit the display", () => {
    const res = mockResponse();
    postInfoScreens({ body: { infoScreens: [{ message: "fine" }, { message: "x".repeat(33) }] } } as any, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toMatch(/Info screen 2: line 1 is 33 characters/);
    expect(mockConfig.setInfoScreens).not.toHaveBeenCalled();
  });

  it("refuses a body that isn't a list", () => {
    const res = mockResponse();
    postInfoScreens({ body: {} } as any, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockConfig.setInfoScreens).not.toHaveBeenCalled();
  });

  it("says so when it can't save", () => {
    mockConfig.setInfoScreens.mockImplementationOnce(() => {
      throw new Error("disk full");
    });

    const res = mockResponse();
    postInfoScreens({ body: { infoScreens: [{ message: "fine" }] } } as any, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
