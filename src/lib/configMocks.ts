import { EventEmitter } from "stream";

export const mockTorontoConfig = () => {
  jest.mock("lib/config/config", () => ({
    initializeConfig: () => ({
      primaryLocation: { province: "ON", location: "s0000458", name: "Toronto" },
      climateNormals: { stationID: 5051, climateID: 6158350, province: "ON" },
      misc: {},
    }),
  }));
};

const fakeEventEmitter = new EventEmitter();
export const mockAMQP = () => {
  jest.mock("lib/amqp/sarra-canada-amqp", () => ({
    ...jest.requireActual("lib/amqp/sarra-canada-amqp"),
    listen: () => ({ emitter: fakeEventEmitter, connection: jest.fn() }),
  }));
};
