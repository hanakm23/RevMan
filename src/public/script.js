const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const player = {
  x: 100,
  y: 100,
  size: 20,
  speed: 3,
};

const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function update() {
  if (keys["ArrowUp"]) {
    player.y -= player.speed;
  }
  if (keys["ArrowDown"]) {
    player.y += player.speed;
  }
  if (keys["ArrowLeft"]) {
    player.x -= player.speed;
  }
  if (keys["ArrowRight"]) {
    player.x += player.speed;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ghost (player)
  ctx.fillStyle = "cyan";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

const ghosts = [
  { x: 400, y: 300, speed: 1.5 },
  { x: 600, y: 200, speed: 1.2 },
];

function updateGhosts() {
  ghosts.forEach((g) => {
    const dx = player.x - g.x;
    const dy = player.y - g.y;

    const dist = Math.hypot(dx, dy);

    g.x += (dx / dist) * g.speed;
    g.y += (dy / dist) * g.speed;
  });
}

function drawGhosts() {
  ctx.fillStyle = "red";
  ghosts.forEach((g) => {
    ctx.beginPath();
    ctx.arc(g.x, g.y, 15, 0, Math.PI * 2);
    ctx.fill();
  });
}

function loop() {
  update();
  updateGhosts();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  draw();
  drawGhosts();

  requestAnimationFrame(loop);
}

loop();