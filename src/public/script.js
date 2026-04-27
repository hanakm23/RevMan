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

// Players array - each player controls one ghost
const players = [
  { id: 0, active: true, nextDir: { x: 0, y: 0 } },
  { id: 1, active: false, nextDir: { x: 0, y: 0 } },
  { id: 2, active: false, nextDir: { x: 0, y: 0 } },
  { id: 3, active: false, nextDir: { x: 0, y: 0 } },
];

const ghosts = [
  {
    x: 10,
    y: 9,
    color: "red",
    type: "blinky",
    dir: { x: -1, y: 0 },
    state: "normal",
    playerIndex: 0,
  },
  {
    x: 9,
    y: 9,
    color: "pink",
    type: "pinky",
    dir: { x: 1, y: 0 },
    state: "normal",
    playerIndex: 1,
  },
  {
    x: 10,
    y: 10,
    color: "cyan",
    type: "inky",
    dir: { x: 0, y: -1 },
    state: "normal",
    playerIndex: 2,
  },
  {
    x: 9,
    y: 10,
    color: "orange",
    type: "clyde",
    dir: { x: 0, y: 1 },
    state: "normal",
    playerIndex: 3,
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

// Key mappings for each player
const keyBindings = {
  player1: {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  },
  player2: {
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
  },
  player3: {
    i: { x: 0, y: -1 },
    k: { x: 0, y: 1 },
    j: { x: -1, y: 0 },
    l: { x: 1, y: 0 },
  },
  player4: {
    5: { x: 0, y: -1 },
    2: { x: 0, y: 1 },
    4: { x: -1, y: 0 },
    6: { x: 1, y: 0 },
  },
};

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  // Player 1 (Arrow keys)
  if (key in keyBindings.player1 && players[0].active) {
    players[0].nextDir = keyBindings.player1[key];
  }
  // Player 2 (WASD)
  if (key in keyBindings.player2 && players[1].active) {
    players[1].nextDir = keyBindings.player2[key];
  }
  // Player 3 (IJKL)
  if (key in keyBindings.player3 && players[2].active) {
    players[2].nextDir = keyBindings.player3[key];
  }
  // Player 4 (Numpad 5,2,4,6)
  if (key in keyBindings.player4 && players[3].active) {
    players[3].nextDir = keyBindings.player4[key];
  }

  // Toggle player on number keys (1-4)
  if (["1", "2", "3", "4"].includes(key)) {
    const playerIndex = parseInt(key) - 1;
    players[playerIndex].active = !players[playerIndex].active;
  }
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
    ghosts.forEach((g) => {
      if (!players[g.playerIndex].active) {
        g.dir = opposite(g.dir);
      }
    });
    lastMode = mode;
  }
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
    const isPlayerControlled = players[g.playerIndex].active;

    // Update direction for player-controlled ghosts
    if (isPlayerControlled) {
      const nextDir = players[g.playerIndex].nextDir;
      const nx = g.x + nextDir.x;
      const ny = g.y + nextDir.y;

      if (canMove(nx, ny)) {
        g.dir = nextDir;
        players[g.playerIndex].nextDir = { x: 0, y: 0 };
      }
    } else {
      // AI logic for non-player ghosts
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
    }

    g.x += g.dir.x;
    g.y += g.dir.y;

    if (g.state === "dead" && g.x === 10 && g.y === 9) {
      g.state = "normal";
    }
  });

  // Check collisions between ghosts
  for (let i = 0; i < ghosts.length; i++) {
    for (let j = i + 1; j < ghosts.length; j++) {
      if (ghosts[i].x === ghosts[j].x && ghosts[i].y === ghosts[j].y) {
        if (frightened) {
          if (ghosts[i].state !== "dead") {
            score += 200;
            ghosts[i].state = "dead";
          }
          if (ghosts[j].state !== "dead") {
            score += 200;
            ghosts[j].state = "dead";
          }
        } else {
          // Both players lose if they collide and no one is frightened
          gameOver = true;
        }
      }
    }
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

  if (g.type === "blinky") {
    const target = ghosts[0];
    return { x: target.x, y: target.y };
  }

  if (g.type === "pinky") {
    const target = ghosts[0];
    return {
      x: target.x + target.dir.x * 4,
      y: target.y + target.dir.y * 4,
    };
  }

  if (g.type === "inky") {
    const b = ghosts[0];
    const t = ghosts[0];
    const px = t.x + t.dir.x * 2;
    const py = t.y + t.dir.y * 2;
    return {
      x: b.x + (px - b.x) * 2,
      y: b.y + (py - b.y) * 2,
    };
  }

  const target = ghosts[0];
  const d = Math.hypot(target.x - g.x, target.y - g.y);
  return d > 8 ? { x: target.x, y: target.y } : { x: 1, y: ROWS - 2 };
}

function updatePellets() {
  ghosts.forEach((g) => {
    if (map[g.y][g.x] === 2) {
      map[g.y][g.x] = 0;
      score += 10;
    }

    if (map[g.y][g.x] === 3) {
      map[g.y][g.x] = 0;
      score += 50;

      frightened = true;
      frightenedTimer = 0;

      ghosts.forEach((ghost) => {
        if (!players[ghost.playerIndex].active) {
          ghost.dir = opposite(ghost.dir);
        }
      });
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
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);

  // Display player status
  let statusText = "Active Players: ";
  const activePlayers = players
    .map((p, i) => (p.active ? i + 1 : null))
    .filter((n) => n !== null);
  statusText += activePlayers.length > 0 ? activePlayers.join(", ") : "None";
  ctx.fillText(statusText, 10, canvas.height - 10);

  // Display controls
  ctx.font = "12px Arial";
  ctx.fillText(
    "P1: Arrows | P2: WASD | P3: IJKL | P4: Numpad | Press 1-4 to toggle",
    10,
    canvas.height - 25,
  );

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.font = "16px Arial";
    ctx.fillText(
      `Final Score: ${score}`,
      canvas.width / 2,
      canvas.height / 2 + 40,
    );
  }
}

function loop() {
  frame++;

  if (!gameOver) {
    updateGhosts();
    updatePellets();
  }

  draw();
  requestAnimationFrame(loop);
}

loop();
