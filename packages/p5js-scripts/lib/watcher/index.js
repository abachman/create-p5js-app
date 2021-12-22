const EventEmitter = require("events");
const chokidar = require("chokidar");

class Watcher extends EventEmitter {
  constructor(paths) {
    super();

    this.debounceTimeout = 500;
    this.paths = paths;
    this.mapping = {};
    this.timings = {};
    this.queue = {};

    this.attach();
    this.listen();
  }

  attach() {
    console.log("attaching", this.paths);
    Object.keys(this.paths).forEach((pathName) => {
      const now = Date.now();
      const path = this.paths[pathName];
      const watcher = chokidar.watch(path);
      this.mapping[pathName] = watcher;
      this.timings[pathName] = now;
      this.queue[pathName] = [];
    });
  }

  listen() {
    Object.keys(this.mapping).forEach((pathName) => {
      const watcher = this.mapping[pathName];

      watcher.on("all", (event, path) => {
        this.add(pathName, { event, path });

        const now = Date.now();
        if (this.distant(pathName, now)) {
          // ready to flush
          this.flush(pathName);
        }
      });
    });
  }

  distant(id, ts) {
    return this.timings[id] && ts - this.timings[id] > this.debounceTimeout;
  }

  add(id, event) {
    this.queue[id].push(event);
  }

  flush(id) {
    this.emit(id, this.queue[id]);
    this.queue[id] = [];
    this.timings[id] = Date.now();
  }
}

module.exports = Watcher;
