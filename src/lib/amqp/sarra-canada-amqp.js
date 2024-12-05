const amqp = require("amqp");
const crypto = require("crypto");
const EventEmitter = require("events");
const url = require("url");
const { name: APPLICATION, version: VERSION } = require("../../../package.json");
const AMQP_TOPIC_PREFIX = "v02.post";
const AMQP_EXCHANGE = "xpublic";
const AMQP_HEARTBEAT = 300;

function random_string() {
  return crypto.pseudoRandomBytes(8).toString("hex");
}

export function listen(options) {
  // Determine configurable parameters.
  let amqp_host = "dd.weather.gc.ca";
  let amqp_port = 5671;
  let amqp_user = "anonymous";
  let amqp_password = "anonymous";
  let amqp_subtopic = "*.WXO-DD.#";
  let amqp_queue = null;
  let amqp_expires = 10800000; // three hours in milliseconds
  let amqp_reconnect_limit_ms = 120000;
  if (options) {
    if (options.amqp_host) {
      amqp_host = options.amqp_host;
    }
    if (options.amqp_port > 0) {
      amqp_port = options.amqp_port;
    }
    if (options.amqp_user) {
      amqp_user = options.amqp_user;
    }
    if (options.amqp_password) {
      amqp_password = options.amqp_password;
    }
    if (options.amqp_subtopic) {
      amqp_subtopic = options.amqp_subtopic;
    }
    if (options.amqp_queue) {
      amqp_queue = options.amqp_queue;
    }
    if (options.amqp_expires > 0) {
      amqp_expires = options.amqp_expires;

      // Do not allow queues to persist for longer than 24 hours, even if
      // requested. We want to be polite customers!
      if (amqp_expires > 86400000) {
        amqp_expires = 86400000;
      }
    }
    if (options.amqp_reconnect_limit_ms) {
      amqp_reconnect_limit_ms = options.amqp_reconnect_limit_ms;
    }
  }

  // Determine queue options.
  const amqp_queue_options = {};
  if (amqp_queue === null) {
    amqp_queue = APPLICATION + "_" + random_string();
    amqp_queue_options.exclusive = true;
  } else {
    amqp_queue_options.durable = true;
    amqp_queue_options.autoDelete = false;
    amqp_queue_options.arguments = { "x-expires": amqp_expires };
  }

  // Create the EventEmitter that we'll be returning.
  const emitter = new EventEmitter();

  // Create an AMQP connection.
  const connection = amqp.createConnection(
    {
      host: amqp_host,
      port: amqp_port,
      login: amqp_user,
      password: amqp_password,
      heartbeat: AMQP_HEARTBEAT,
      clientProperties: { applicationName: APPLICATION, version: VERSION },
      ssl: { enabled: true },
    },
    {
      reconnectBackoffStrategy: "exponential",
      reconnectExponentialLimit: amqp_reconnect_limit_ms,
    }
  );

  // If there's an error on the connection, pass it along to the consumer.
  connection.on("error", (err) => emitter.emit("error", err));

  // When a connection becomes available (either because we are connecting for
  // the first time, or because we're reconnecting after some kind of network
  // failure), create a queue and bind it to the requested exchange and topic.
  connection.on("ready", () => {
    connection.queue("q_" + amqp_user + "_" + amqp_queue, amqp_queue_options, (q) => {
      q.bind(AMQP_EXCHANGE, AMQP_TOPIC_PREFIX + "." + amqp_subtopic);

      // Subscribe to messages on the queue. If we get a message, parse it
      // and pass it along to the caller.
      //
      // http://metpx.sourceforge.net/sr_post.7.html
      q.subscribe((message) => {
        if (message.contentType === "text/plain") {
          const [timestamp, srcpath, relativepath] = message.data.toString("utf8").split("\n", 1)[0].split(" ", 3);
          const date = new Date(
            timestamp.slice(0, 4) +
              "-" +
              timestamp.slice(4, 6) +
              "-" +
              timestamp.slice(6, 8) +
              "T" +
              timestamp.slice(8, 10) +
              ":" +
              timestamp.slice(10, 12) +
              ":" +
              timestamp.slice(12, 18) +
              "Z"
          );
          const path = url.resolve(srcpath, relativepath);
          emitter.emit("message", date, path);
        }
      });
    });
  });

  return { emitter, connection };
}
