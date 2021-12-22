const esbuild = require("esbuild");
const path = require("path");

const DEFAULT_PORT = 5555;
const clientEntry = path.join(__dirname, "client", "index.js");
let clientBuilt = false;

async function run(options) {
  const port = options ? options.port : DEFAULT_PORT;

  return Promise.all([
    esbuild
      .build({
        entryPoints: ["src/index.js"],
        bundle: true,
        outfile: "public/sketch.js",
      })
      .then(() => {
        console.log("[Builder] built sketch");
      })
      .catch(() => {
        console.error("failed to build sketch!");
        process.exit(1);
      }),
    // reloader
    !clientBuilt
      ? esbuild
          .build({
            entryPoints: [clientEntry],
            bundle: true,
            outfile: "public/reload.js",
            define: {
              "process.env.WS_PORT": 5555,
            },
          })
          .then(() => {
            clientBuilt = true;
            console.log("[Builder] built reloader");
          })
          .catch(() => {
            console.error("failed to build reloader!");
            process.exit(1);
          })
      : Promise.resolve(),
  ])
    .then(() => {
      console.log("[Builder] complete");
    })
    .catch((ex) => {
      console.error("build failed:", ex.message);
      console.error("bailing out");
      process.exit(1);
    });
}

module.exports = { run };
