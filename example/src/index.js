import "p5";

let x,
  y,
  h,
  dx = 3,
  dy = 7,
  dh = 1;

function setup() {
  createCanvas(400, 400);
  noStroke();
  ellipseMode(CENTER);
  colorMode(HSB);
  background(255);

  x = 0;
  y = 0;
  h = 0;
}

function draw() {
  // background(255);
  const sat = constrain(parseInt(map(mouseX, 0, width, 20, 100)), 20, 100);

  fill(h, sat, 100);
  ellipse(x, y, 30, 30);

  if (x < 0 || x + dx > width) {
    dx *= -1;
  }
  if (y < 0 || y + dy > height) {
    dy *= -1;
  }
  x += dx;
  y += dy;
  h = (h + dh) % 256;
}

// export so that script runs in bundled env
window.draw = draw;
window.setup = setup;
