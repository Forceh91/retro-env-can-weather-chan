import moxios from "moxios";
import axios from "lib/backendAxios";
import { getTempRecordForDate } from "lib/temprecords";
import response from "./testdata/temprecords/records.json";

describe("Temp record for day", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gets the correct record for the specified date", async () => {
    moxios.wait(() => {
      moxios.requests
        .mostRecent()
        ?.respondWith({ status: 200, response })
        .then(() => {
          expect(record).toStrictEqual(response.records[1]);
        });
    });

    const record = await getTempRecordForDate("http://temprecords.com", new Date(2023, 0, 2));
  });

  it("gets the correct record for the specified date before feb 29th on a leap year", async () => {
    moxios.wait(() => {
      moxios.requests
        .mostRecent()
        ?.respondWith({ status: 200, response })
        .then(() => {
          expect(record).toStrictEqual(response.records[45]);
        });
    });

    const record = await getTempRecordForDate("http://temprecords.com", new Date(2020, 1, 15));
  });

  it("gets the correct record for the specified date after feb 29th on a leap year", async () => {
    moxios.wait(() => {
      moxios.requests
        .mostRecent()
        ?.respondWith({ status: 200, response })
        .then(() => {
          expect(record).toStrictEqual(response.records[59]);
        });
    });

    const record = await getTempRecordForDate("http://temprecords.com", new Date(2020, 1, 29));
  });

  it("handles a malformed 2xx response correctly (1)", async () => {
    moxios.wait(() => {
      moxios.requests
        .mostRecent()
        ?.respondWith({ status: 200, response: { records: [] } })
        .then(() => {
          expect(record).toBeUndefined();
        });
    });

    const record = await getTempRecordForDate("http://temprecords.com", new Date(2023, 0, 2));
  });

  it("handles a malformed 2xx response correctly (2)", async () => {
    moxios.wait(() => {
      moxios.requests
        .mostRecent()
        ?.respondWith({ status: 200, response: { records: response.records.slice(0, 5) } })
        .then(() => {
          expect(record).toBeUndefined();
        });
    });

    const record = await getTempRecordForDate("http://temprecords.com", new Date(2023, 0, 11));
  });

  it("handles a 4xx response correctly", async () => {
    moxios.wait(() => {
      moxios.requests
        .mostRecent()
        ?.respondWith({ status: 404 })
        .then(() => {
          expect(record).toBeUndefined();
        });
    });

    const record = await getTempRecordForDate("http://temprecords.com", new Date(2023, 0, 2));
  });

  it("handles a 5xx response correctly", async () => {
    moxios.wait(() => {
      moxios.requests
        .mostRecent()
        ?.respondWith({ status: 500 })
        .then(() => {
          expect(record).toBeUndefined();
        });
    });

    const record = await getTempRecordForDate("http://temprecords.com", new Date(2023, 0, 2));
  });
});
