const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 24;
const ROWS = 21;
const COLS = 21;

canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

// ================= MENU / GAME STATE =================
let gameStarted = false;
let countdown = 0;

const menu = document.getElementById("menu");
const countdownEl = document.getElementById("countdown");
const gameOverModal = document.getElementById("game-over");
const finalScoreEl = document.getElementById("final-score");
const scoreDisplay = document.getElementById("score-display");
const activePlayersDisplay = document.getElementById("active-players");
const restartBtn = document.getElementById("restart-btn");

// ================= MAP =================
// 0 empty, 1 wall, 2 pellet, 3 power pellet
const initialMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,2,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,2,1],
  [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,1,1,1],
  [0,0,0,1,2,1,2,2,2,2,2,2,2,2,1,2,1,0,0,0,0],
  [1,1,1,1,2,1,2,1,1,0,0,1,1,2,1,2,1,1,1,1,1],
  [0,0,0,0,2,2,2,1,0,0,0,0,1,2,2,2,0,0,0,0,0],
  [1,1,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1],
  [0,0,0,1,2,1,2,2,2,2,2,2,2,2,1,2,1,0,0,0,0],
  [1,1,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,2,1],
  [1,3,2,1,2,1,2,2,2,1,1,2,2,2,1,2,1,2,2,3,1],
  [1,1,2,1,2,1,1,1,2,1,1,2,1,1,1,2,1,2,1,1,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,1,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1,2,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

let map = JSON.parse(JSON.stringify(initialMap));

// ================= PLAYERS =================
const players = [
  { active: true, nextDir: { x: 0, y: 0 } },
  { active: false, nextDir: { x: 0, y: 0 } },
  { active: false, nextDir: { x: 0, y: 0 } },
  { active: false, nextDir: { x: 0, y: 0 } },
];

// ================= GHOSTS =================
const ghosts = [
  { x: 10, y: 9, color: "red", type: "blinky", dir: { x: -1, y: 0 }, state: "normal", playerIndex: 0 },
  { x: 9, y: 9, color: "pink", type: "pinky", dir: { x: 1, y: 0 }, state: "normal", playerIndex: 1 },
  { x: 10, y: 10, color: "cyan", type: "inky", dir: { x: 0, y: -1 }, state: "normal", playerIndex: 2 },
  { x: 9, y: 10, color: "orange", type: "clyde", dir: { x: 0, y: 1 }, state: "normal", playerIndex: 3 },
];

// ================= GAME STATE =================
let score = 0;
let gameOver = false;

let mode = "scatter";
let modeTimer = 0;
const MODE_DURATIONS = { scatter: 420, chase: 420 };

let frightened = false;
let frightenedTimer = 0;
const FRIGHTENED_DURATION = 300;

let frame = 0;
let pelletCount = 0;

// ================= INPUT =================
const keyBindings = [
  {
    "ArrowUp": { x: 0, y: -1 },
    "ArrowDown": { x: 0, y: 1 },
    "ArrowLeft": { x: -1, y: 0 },
    "ArrowRight": { x: 1, y: 0 },
  },
  {
    "w": { x: 0, y: -1 },
    "s": { x: 0, y: 1 },
    "a": { x: -1, y: 0 },
    "d": { x: 1, y: 0 },
  },
  {
    "i": { x: 0, y: -1 },
    "k": { x: 0, y: 1 },
    "j": { x: -1, y: 0 },
    "l": { x: 1, y: 0 },
  },
  {
    "5": { x: 0, y: -1 },
    "2": { x: 0, y: 1 },
    "4": { x: -1, y: 0 },
    "6": { x: 1, y: 0 },
  },
];

window.addEventListener("keydown", (e) => {
  const key = e.key;

  keyBindings.forEach((keys, i) => {
    if (key in keys && players[i].active) {
      players[i].nextDir = keys[key];
    }
  });
});

// ================= MENU =================
document.querySelectorAll(".menu button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const count = parseInt(btn.dataset.players);

    players.forEach((p, i) => {
      p.active = i < count;
    });

    activePlayersDisplay.textContent = count;
    startCountdown();
  });
});

restartBtn.addEventListener("click", () => {
  gameOver = false;
  gameStarted = false;
  score = 0;
  map = JSON.parse(JSON.stringify(initialMap));
  pelletCount = countPellets();
  modeTimer = 0;
  mode = "scatter";
  frightened = false;
  frightenedTimer = 0;
  frame = 0;

  ghosts.forEach((g) => {
    g.state = "normal";
    g.dir = g.playerIndex === 0 ? { x: -1, y: 0 } : { x: 1, y: 0 };
  });

  gameOverModal.style.display = "none";
  menu.style.display = "flex";
});

function startCountdown() {
  countdown = 3;
  countdownEl.textContent = countdown;

  const interval = setInterval(() => {
    countdown--;

    if (countdown > 0) {
      countdownEl.textContent = countdown;
    } else {
      countdownEl.textContent = "GO!";
    }

    if (countdown < 0) {
      clearInterval(interval);
      menu.style.display = "none";
      gameStarted = true;
      pelletCount = countPellets();
    }
  }, 1000);
}

// ================= HELPERS =================
function countPellets() {
  let count = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (map[y][x] === 2 || map[y][x] === 3) {
        count++;
      }
    }
  }
  return count;
}

const canMove = (x, y) => {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  return map[y][x] !== 1;
};

const neighbors = (x, y) => {
  const moves = [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ];
  return moves.filter((n) => canMove(n.x, n.y));
};

// ================= AI =================
function getNextMove(g) {
  const moves = neighbors(g.x, g.y);

  if (moves.length === 0) return { x: g.x, y: g.y };

  // Frightened mode: random movement
  if (frightened && g.state === "normal") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Chase the first player's ghost (Blinky)
  const target = ghosts[0];

  return moves.reduce(
    (best, move) => {
      const dist = Math.hypot(target.x - move.x, target.y - move.y);
      return dist < best.dist ? { move, dist } : best;
    },
    { move: moves[0], dist: Infinity }
  ).move;
}

// ================= GAME LOGIC =================
function updateGhosts() {
  if (frame % 2 !== 0) return;

  ghosts.forEach((g) => {
    if (players[g.playerIndex].active) {
      // Player control
      const next = players[g.playerIndex].nextDir;
      if (next.x !== 0 || next.y !== 0) {
        if (canMove(g.x + next.x, g.y + next.y)) {
          g.dir = next;
          players[g.playerIndex].nextDir = { x: 0, y: 0 };
        }
      }
    } else {
      // AI control
      const next = getNextMove(g);
      g.dir = { x: next.x - g.x, y: next.y - g.y };
    }

    // Move ghost
    const newX = g.x + g.dir.x;
    const newY = g.y + g.dir.y;

    if (canMove(newX, newY)) {
      g.x = newX;
      g.y = newY;
    }
  });
}

function updatePellets() {
  ghosts.forEach((g) => {
    const cell = map[g.y][g.x];

    if (cell === 2) {
      map[g.y][g.x] = 0;
      score += 10;
      pelletCount--;
    } else if (cell === 3) {
      map[g.y][g.x] = 0;
      score += 50;
      pelletCount--;
      frightened = true;
      frightenedTimer = 0;
    }
  });
}

function checkCollisions() {
  for (let i = 0; i < ghosts.length; i++) {
    for (let j = i + 1; j < ghosts.length; j++) {
      const g1 = ghosts[i];
      const g2 = ghosts[j];

      if (g1.x === g2.x && g1.y === g2.y) {
        // Both ghosts on same tile
        if (frightened) {
          // In frightened mode, ghosts can be "caught"
          if (g1.playerIndex === 0) {
            g2.state = "dead";
          } else if (g2.playerIndex === 0) {
            g1.state = "dead";
          }
        } else {
          // Normal mode: game ends
          gameOver = true;
        }
      }
    }
  }
}

function updateGameState() {
  // Update frightened mode
  if (frightened) {
    frightenedTimer++;
    if (frightenedTimer >= FRIGHTENED_DURATION) {
      frightened = false;
      ghosts.forEach((g) => {
        if (g.state === "dead") {
          g.state = "normal";
        }
      });
    }
  }

  // Update chase/scatter mode
  modeTimer++;
  const duration = MODE_DURATIONS[mode];
  if (modeTimer >= duration) {
    modeTimer = 0;
    mode = mode === "scatter" ? "chase" : "scatter";
  }

  // Check win condition
  if (pelletCount === 0) {
    gameOver = true;
  }

  // Check loss condition (ghosts converge on player 1)
  checkCollisions();
}

// ================= DRAW =================
function draw() {
  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw walls
  ctx.fillStyle = "#0033ff";
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (map[y][x] === 1) {
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // Draw pellets
  ctx.fillStyle = "#fff";
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (map[y][x] === 2) {
        ctx.beginPath();
        ctx.arc(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else if (map[y][x] === 3) {
        ctx.beginPath();
        ctx.arc(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  // Draw ghosts
  ghosts.forEach((g) => {
    if (g.state === "dead") {
      ctx.fillStyle = "#333";
    } else if (frightened) {
      ctx.fillStyle = "#0099ff";
    } else {
      ctx.fillStyle = g.color;
    }

    ctx.beginPath();
    ctx.arc(
      g.x * TILE_SIZE + TILE_SIZE / 2,
      g.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw eyes
    ctx.fillStyle = "#fff";
    ctx.fillRect(
      g.x * TILE_SIZE + TILE_SIZE / 2 - 6,
      g.y * TILE_SIZE + TILE_SIZE / 2 - 4,
      3,
      3
    );
    ctx.fillRect(
      g.x * TILE_SIZE + TILE_SIZE / 2 + 3,
      g.y * TILE_SIZE + TILE_SIZE / 2 - 4,
      3,
      3
    );
  });

  // Draw UI
  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 10, 25);
  ctx.fillText(`Pellets: ${pelletCount}`, 10, 50);
  ctx.fillText(`Mode: ${mode.toUpperCase()}`, 10, 75);

  if (frightened) {
    ctx.fillStyle = "#ff00ff";
    ctx.fillText("FRIGHTENED!", 200, 25);
  }

  // Update UI outside canvas
  scoreDisplay.textContent = score;
}

// ================= LOOP =================
function loop() {
  frame++;

  if (gameStarted && !gameOver) {
    updateGhosts();
    updatePellets();
    updateGameState();
  }

  if (gameOver && gameStarted) {
    gameStarted = false;
    finalScoreEl.textContent = score;
    gameOverModal.style.display = "flex";
  }

  draw();
  requestAnimationFrame(loop);
}

loop();
