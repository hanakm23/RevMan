const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 24;
const ROWS = 21;
const COLS = 21;

canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

// 0 empty, 1 wall, 2 pellet, 3 power pellet
const map = [
  /* KEEP YOUR MAP EXACTLY AS IS */
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 2, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 2, 1, 1, 0, 0, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 2, 2, 2, 1, 0, 0, 0, 0, 1, 2, 2, 2, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 2, 1],
  [1, 3, 2, 1, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 1, 2, 2, 3, 1],
  [1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const player = {
  x: 1,
  y: 1,
  dir: { x: 0, y: 0 },
  nextDir: { x: 0, y: 0 },
};

const ghosts = [
  {
    x: 10,
    y: 9,
    color: "red",
    type: "blinky",
    dir: { x: -1, y: 0 },
    state: "normal",
  },
  {
    x: 9,
    y: 9,
    color: "pink",
    type: "pinky",
    dir: { x: 1, y: 0 },
    state: "normal",
  },
  {
    x: 10,
    y: 10,
    color: "cyan",
    type: "inky",
    dir: { x: 0, y: -1 },
    state: "normal",
  },
  {
    x: 9,
    y: 10,
    color: "orange",
    type: "clyde",
    dir: { x: 0, y: 1 },
    state: "normal",
  },
];

let score = 0;
let gameOver = false;

let mode = "scatter";
let lastMode = mode;
let modeTimer = 0;

let frightened = false;
let frightenedTimer = 0;
const FRIGHTENED_DURATION = 600;

let frame = 0;
const GHOST_SPEED = 2;
const FRIGHTENED_SPEED = 4;

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") player.nextDir = { x: 0, y: -1 };
  if (e.key === "ArrowDown") player.nextDir = { x: 0, y: 1 };
  if (e.key === "ArrowLeft") player.nextDir = { x: -1, y: 0 };
  if (e.key === "ArrowRight") player.nextDir = { x: 1, y: 0 };
});

const canMove = (x, y) => map[y] && map[y][x] !== 1;

const opposite = (d) => ({ x: -d.x, y: -d.y });

const neighbors = (x, y) =>
  [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ].filter((n) => canMove(n.x, n.y));

function updateMode() {
  modeTimer++;

  if (mode === "scatter" && modeTimer > 300) {
    mode = "chase";
    modeTimer = 0;
  } else if (mode === "chase" && modeTimer > 600) {
    mode = "scatter";
    modeTimer = 0;
  }

  if (mode !== lastMode) {
    ghosts.forEach((g) => (g.dir = opposite(g.dir)));
    lastMode = mode;
  }
}

function updatePlayer() {
  const nx = player.x + player.nextDir.x;
  const ny = player.y + player.nextDir.y;

  if (canMove(nx, ny)) player.dir = player.nextDir;

  const tx = player.x + player.dir.x;
  const ty = player.y + player.dir.y;

  if (canMove(tx, ty)) {
    player.x = tx;
    player.y = ty;
  }

  if (map[player.y][player.x] === 2) {
    map[player.y][player.x] = 0;
    score += 10;
  }

  if (map[player.y][player.x] === 3) {
    map[player.y][player.x] = 0;
    score += 50;

    frightened = true;
    frightenedTimer = 0;

    ghosts.forEach((g) => (g.dir = opposite(g.dir)));
  }
}

function getTarget(g) {
  if (g.state === "dead") return { x: 10, y: 9 };

  if (mode === "scatter") {
    if (g.type === "blinky") return { x: COLS - 2, y: 1 };
    if (g.type === "pinky") return { x: 1, y: 1 };
    if (g.type === "inky") return { x: COLS - 2, y: ROWS - 2 };
    return { x: 1, y: ROWS - 2 };
  }

  if (g.type === "blinky") return { x: player.x, y: player.y };

  if (g.type === "pinky") {
    return {
      x: player.x + player.dir.x * 4,
      y: player.y + player.dir.y * 4,
    };
  }

  if (g.type === "inky") {
    const b = ghosts[0];
    const px = player.x + player.dir.x * 2;
    const py = player.y + player.dir.y * 2;
    return {
      x: b.x + (px - b.x) * 2,
      y: b.y + (py - b.y) * 2,
    };
  }

  const d = Math.hypot(player.x - g.x, player.y - g.y);
  return d > 8 ? { x: player.x, y: player.y } : { x: 1, y: ROWS - 2 };
}

function updateGhosts() {
  updateMode();

  if (frightened) {
    frightenedTimer++;
    if (frightenedTimer > FRIGHTENED_DURATION) frightened = false;
  }

  const speed = frightened ? FRIGHTENED_SPEED : GHOST_SPEED;
  if (frame % speed !== 0) return;

  ghosts.forEach((g) => {
    const moves = neighbors(g.x, g.y);

    let next;

    if (frightened && g.state !== "dead") {
      next = moves[Math.floor(Math.random() * moves.length)];
    } else {
      const target = getTarget(g);
      let best = Infinity;

      moves.forEach((m) => {
        const d = Math.hypot(target.x - m.x, target.y - m.y);
        if (d < best) {
          best = d;
          next = m;
        }
      });
    }

    const dir = { x: next.x - g.x, y: next.y - g.y };
    g.dir = dir;

    g.x += g.dir.x;
    g.y += g.dir.y;

    if (g.state === "dead" && g.x === 10 && g.y === 9) {
      g.state = "normal";
    }

    if (g.x === player.x && g.y === player.y) {
      if (frightened && g.state !== "dead") {
        score += 200;
        g.state = "dead";
      } else if (!frightened) {
        gameOver = true;
      }
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const t = map[y][x];

      if (t === 1) {
        ctx.fillStyle = "blue";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      if (t === 2 || t === 3) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          t === 3 ? 6 : 3,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }

  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(
    player.x * TILE_SIZE + TILE_SIZE / 2,
    player.y * TILE_SIZE + TILE_SIZE / 2,
    TILE_SIZE / 2 - 2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ghosts.forEach((g) => {
    if (g.state === "dead") ctx.fillStyle = "white";
    else if (frightened) ctx.fillStyle = "blue";
    else ctx.fillStyle = g.color;

    ctx.beginPath();
    ctx.arc(
      g.x * TILE_SIZE + TILE_SIZE / 2,
      g.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2 - 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });

  ctx.fillStyle = "white";
  ctx.fillText(`Score: ${score}`, 10, 20);
}

function loop() {
  frame++;

  if (!gameOver) {
    updatePlayer();
    updateGhosts();
  }

  draw();
  requestAnimationFrame(loop);
}

loop();
