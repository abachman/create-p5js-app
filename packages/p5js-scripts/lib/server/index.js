const path = require("path");
const http = require("http");
const EventEmitter = require("events");
const express = require("express");
const logger = require("morgan");
const { WebSocketServer } = require("ws");
const AsyncLock = require("async-lock");
const open = require("open");
const Buffer = require("buffer")

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

const FAVICON = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T///////8JWPfcAAAACXBIWXMAAABIAAAASABGyWs+AAAAF0lEQVRIx2NgGAWjYBSMglEwCkbBSAcACBAAAeaR9cIAAAAASUVORK5CYII="
app.get("/favicon.ico", (_req, res) => {
  const img = Buffer.from(FAVICON, 'base64');
 res.writeHead(200, {
        'Content-Type': 'image/x-icon',
        'Content-Length': img.length
      });
 res.end(img);
})

app.get("/", (request, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use((request, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// We need a websocket endpoint to notify listeners of updates
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

  // Prevent multiple simultaneous builds
  const lock = new AsyncLock();
  watcher.on("src", () => {
    lock.acquire("build", (done) => {
      console.log("building...");
      Builder.run({ port })
        .then(() => done())
        .catch((error) => {
          console.error("build error", error);
        });
    });
  });

  server.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);
    console.log(`  in ${rootPath}, opening browser...`);
    bus.emit("ready");
  });

  bus.once("ready", () => open(`http://localhost:${port}`));
}

module.exports = { run };
