const express = require("express");
const path = require("path");
const logger = require("morgan");
const { WebSocketServer } = require("ws");
const http = require("http");
const AsyncLock = require("async-lock");
const EventEmitter = require("events");
const open = require("open");

const Builder = require("../builder");
const Watcher = require("../watcher");

const rootPath = process.cwd();
const publicPath = path.join(rootPath, "public");

const signal = { ready: false };
const bus = new EventEmitter();
bus.on("ready", () => {
  signal.ready = true;
});

const app = express();

app.use(express.static("public"));
app.use(logger("combined"));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// we need a websocket endpoint to notify listeners of updates
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws) {
  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  bus.on("public-change", (changes) => {
    ws.send(JSON.stringify({ event: "public-change", payload: changes }));
  });
});

async function run(port) {
  await Builder.run({ port });

  const sourcePath = path.join(rootPath, "src");
  const watcher = new Watcher({
    public: publicPath,
    src: sourcePath,
  });

  watcher.on("public", (changes) => {
    console.log("emitting public-change", changes);
    bus.emit("public-change", changes);
  });

  // prevent multiple simultaneous builds
  const lock = new AsyncLock();
  watcher.on("src", () => {
    lock.acquire("build", function (done) {
      console.log("building...");
      Builder.run({ port })
        .then(() => done())
        .catch((ex) => {
          console.error("build error", ex);
        });
    });
  });

  server.listen(port, function () {
    console.log(`server is running at http://localhost:${port}`);
    console.log(`  in ${rootPath}, opening browser...`);
    bus.emit("ready");
  });

  bus.once("ready", () => open(`http://localhost:${port}`));
}

module.exports = { run };
