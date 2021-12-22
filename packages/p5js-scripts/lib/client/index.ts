//
function run(): void {
  const ws = new WebSocket(`ws://localhost:${process.env.WS_PORT}`);
  ws.addEventListener("open", () => {
    console.log("opened socket");
  });

  ws.addEventListener("message", (event) => {
    console.log("got message with data", event.data.toString());
    window.location.reload();
  });
}

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    console.log("document ready, launching livereload");
    run();
  }
};
