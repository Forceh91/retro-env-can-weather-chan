import timezonedDate from "timezoned-date";

export interface MockDateSetup {
  reset(): void;
  set(options: { offset?: number; isoDate?: string }): void;
}

const originalDate = Date;

export function setupMockDate(): MockDateSetup {
  function reset() {
    Date = originalDate;
  }

  function set({ isoDate, offset }: { offset?: number; isoDate?: string }) {
    const getMockDate = (): typeof import("mockdate") => {
      let MockDate: typeof import("mockdate") | undefined;
      jest.isolateModules(() => {
        MockDate = require("mockdate");
      });

      return MockDate!;
    };

    if (offset !== undefined) {
      Date = timezonedDate.makeConstructor(offset);
    }

    if (isoDate !== undefined) {
      getMockDate().set(isoDate);
    }
  }

  return { reset, set };
}

export const calculateOffsetToEDT = (expectedOffset: number) => {
  const localDate = new Date();
  const localUTCOffset = -localDate.getTimezoneOffset();

  // return how many minutes we need to take off the local time to get it to EDT (expectedOffset)
  return localUTCOffset - expectedOffset;
};

export const EDT_OFFSET_MINS_FROM_UTC = -240;
