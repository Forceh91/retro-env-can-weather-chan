import { listen } from "lib/amqp";
import { initializeConfig } from "lib/config";
import Logger from "lib/logger";
import { Connection } from "types/amqp.types";

const logger = new Logger("conditions");
const config = initializeConfig();
class CurrentConditions {
  private amqpConnection: Connection;

  constructor() {
    this.startAMQPConnection();
  }

  private startAMQPConnection() {
    if (this.amqpConnection) this.amqpConnection.disconnect();

    // hook up the amqp listener
    const { connection, emitter: listener } = listen({
      amqp_subtopic: `citypage_weather.xml.${config.primaryLocation.province}.#`,
    });

    // handle errors and messages
    listener.on("error", logger.error).on("message", (date: string, url: string) => {
      // make sure its relevant to us
      if (!url.includes(`${config.primaryLocation.location}_e.xml`)) return;

      console.log("Received new conditions");
    });

    // store the connection so we can disconnect if needed
    this.amqpConnection = connection;

    logger.log("Started AMQP conditions listener");
  }
}

let currentConditions: CurrentConditions = null;
export function initializeCurrentConditions(): CurrentConditions {
  if (currentConditions) return currentConditions;

  currentConditions = new CurrentConditions();
  return currentConditions;
}
