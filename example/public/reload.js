(() => {
  // ../packages/p5js-scripts/lib/client/index.ts
  function run() {
    const ws = new WebSocket(`ws://localhost:${5555}`);
    ws.addEventListener("open", () => {
      console.log("opened socket");
    });
    ws.addEventListener("message", (event) => {
      console.log("got message with data", event.data.toString());
      window.location.reload();
    });
  }
  document.onreadystatechange = function() {
    if (document.readyState === "complete") {
      console.log("document ready, launching livereload");
      run();
    }
  };
})();
